require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const { supabaseAdmin, isSupabaseConfigured } = require("./config/supabase");
const { socketAuthMiddleware } = require("./middleware/auth");
const authRoutes = require("./routes/authRoutes");
const classroomRoutes = require("./routes/classroomRoutes");

const app = express();
const server = http.createServer(app);

const frontendUrls = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...frontendUrls,
];

function isOriginAllowed(origin) {
  if (!origin) return true; // Allow server-to-server, curl, Postman, mobile
  const normalized = origin.replace(/\/$/, "");
  if (allowedOrigins.includes(normalized)) return true;
  try {
    const url = new URL(origin);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname.endsWith(".vercel.app")) {
      return true;
    }
  } catch {
    // ignore parse error
  }
  return false;
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// Mount REST API routes
app.use("/api/auth", authRoutes);
app.use("/api/classrooms", classroomRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "CollabBoard API with Supabase is running!",
    supabaseConfigured: isSupabaseConfigured,
  });
});

// ==============================================================================
// Legacy MongoDB Schemas (preserved intact for migration and dual-source safety)
// ==============================================================================
const roomBoardSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  segments: { type: [mongoose.Schema.Types.Mixed], default: [] },
  teacherSocketId: { type: String, default: null },
  teacherName: { type: String, default: null },
  boardLocked: { type: Boolean, default: false },
}, { timestamps: true });

const RoomBoard = mongoose.models.RoomBoard || mongoose.model("RoomBoard", roomBoardSchema);

const chatMessageSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  username: { type: String, required: true },
  message: { type: String, required: true, maxlength: 500 },
  sentAt: { type: Date, default: Date.now },
}, { timestamps: true });
chatMessageSchema.index({ roomId: 1, sentAt: -1 });

const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);

// ==============================================================================
// Ultra-Fast In-Memory Room Caches for Instant (0ms) Real-Time Synchronization
// ==============================================================================
const roomSegmentsCache = new Map(); // roomCode -> Array of active safeSegment items
const roomLockCache = new Map();     // roomCode -> boolean
const roomBoardIdCache = new Map();  // roomCode -> UUID string
const redoStacks = new Map();        // roomCode -> Array of { strokeId, segments }
const roomPendingBatch = new Map();  // roomCode -> Array of segments pending DB insert
const roomFlushTimers = new Map();   // roomCode -> timeout handle
const roomChatDisabledCache = new Map(); // roomCode -> boolean (chat stopped/paused)
const roomLockedStudentsCache = new Map(); // roomCode -> Set of userIds (individually locked)
const roomKickedUsersCache = new Map();    // roomCode -> Set of userIds (kicked from session)

async function flushRoomSegments(room, boardId) {
  const pending = roomPendingBatch.get(room);
  if (!pending || pending.length === 0) return;
  roomPendingBatch.set(room, []);

  try {
    const rows = pending.map((item) => ({
      board_id: boardId,
      stroke_id: item.strokeId,
      kind: item.kind,
      data: item,
      created_by: item.userId || null,
      is_deleted: false,
    }));

    const { error } = await supabaseAdmin.from("board_elements").insert(rows);
    if (error) {
      console.warn(`[Supabase Persistence Notice] Batch insert notice for room ${room}:`, error.message);
    }
  } catch (err) {
    console.warn(`[Supabase Persistence Exception] ${room}:`, err.message);
  }
}

function queueSegmentForPersistence(room, boardId, segment) {
  let pending = roomPendingBatch.get(room);
  if (!pending) {
    pending = [];
    roomPendingBatch.set(room, pending);
  }
  pending.push(segment);

  // Batch insert every 30 segments or 600ms to eliminate network bottlenecks
  if (pending.length >= 30) {
    if (roomFlushTimers.has(room)) {
      clearTimeout(roomFlushTimers.get(room));
      roomFlushTimers.delete(room);
    }
    flushRoomSegments(room, boardId);
  } else if (!roomFlushTimers.has(room)) {
    const timer = setTimeout(() => {
      roomFlushTimers.delete(room);
      flushRoomSegments(room, boardId);
    }, 600);
    roomFlushTimers.set(room, timer);
  }
}

// ==============================================================================
// Socket.IO Server Setup with Supabase Auth Middleware
// ==============================================================================
const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Expose Socket.IO instance to Express routes
app.set("io", io);

// Authenticate socket connections with Supabase JWT
io.use(socketAuthMiddleware);

function getParticipants(room) {
  const lockedUsers = roomLockedStudentsCache.get(room) || new Set();
  return [...(io.sockets.adapter.rooms.get(room) || [])].map((id) => {
    const client = io.sockets.sockets.get(id);
    return {
      id,
      userId: client?.data.userId,
      username: client?.data.username || "Student",
      role: client?.data.role || "student",
      isBoardLocked: Boolean(client?.data.userId && lockedUsers.has(client.data.userId)),
    };
  });
}

function sendParticipants(room) {
  io.to(room).emit("participants-update", getParticipants(room));
}

function validRoom(socket, roomId) {
  const room = typeof roomId === "string" ? roomId.trim().toUpperCase() : "";
  return room && socket.data.roomId === room && socket.rooms.has(room) ? room : null;
}

// Socket event handlers
io.on("connection", (socket) => {
  console.log(`[Socket Connected] SocketId: ${socket.id} | User: ${socket.data.username} (${socket.data.role})`);

  // Join Classroom Room
  socket.on("join-room", async ({ roomId } = {}, callback) => {
    try {
      if (typeof roomId !== "string" || !roomId.trim()) {
        callback?.({ error: "Valid room code required" });
        return;
      }

      const room = roomId.trim().toUpperCase();

      // Look up classroom in Supabase PostgreSQL
      const { data: classroom, error: classError } = await supabaseAdmin
        .from("classrooms")
        .select(`
          id, room_code, name, teacher_id, is_locked,
          boards(id, name),
          teacher:teacher_id(full_name)
        `)
        .eq("room_code", room)
        .maybeSingle();

      if (classError || !classroom) {
        callback?.({ error: "Classroom not found. Please verify the room code." });
        return;
      }

      const isTeacher = classroom.teacher_id === socket.data.userId;
      const userRole = isTeacher ? "teacher" : "student";

      // Check if user was removed from this room session by the teacher
      const kickedSet = roomKickedUsersCache.get(room);
      if (kickedSet && kickedSet.has(socket.data.userId) && !isTeacher) {
        callback?.({ error: "You were removed from this classroom session by the teacher." });
        return;
      }

      // Resilient boardId resolution: memory cache -> classroom query -> lookup -> fallback to classroom.id
      let boardId = classroom.boards?.[0]?.id || roomBoardIdCache.get(room);
      if (!boardId) {
        try {
          const { data: existingBoard } = await supabaseAdmin
            .from("boards")
            .select("id")
            .eq("classroom_id", classroom.id)
            .maybeSingle();
          boardId = existingBoard?.id;
        } catch (e) {
          console.warn("Board lookup notice:", e.message);
        }
      }

      if (!boardId) {
        try {
          const { data: newBoard } = await supabaseAdmin
            .from("boards")
            .insert({ classroom_id: classroom.id, name: "Main Board" })
            .select()
            .maybeSingle();
          boardId = newBoard?.id;
        } catch (e) {
          console.warn("Board creation notice:", e.message);
        }
      }

      // Final fallback to classroom.id so boardId is ALWAYS a valid UUID string
      boardId = boardId || roomBoardIdCache.get(room) || classroom.id;
      roomBoardIdCache.set(room, boardId);

      // Cache room lock state
      if (!roomLockCache.has(room)) {
        roomLockCache.set(room, Boolean(classroom.is_locked));
      }
      const boardLocked = roomLockCache.get(room);

      // Record membership in classroom_members (safe)
      try {
        await supabaseAdmin
          .from("classroom_members")
          .upsert(
            { classroom_id: classroom.id, user_id: socket.data.userId, role: userRole },
            { onConflict: "classroom_id,user_id" }
          );
      } catch (memErr) {
        console.warn("Socket membership record notice:", memErr.message);
      }

      // Handle leaving previous room if switching
      const previousRoom = socket.data.roomId;
      if (previousRoom && previousRoom !== room) {
        socket.leave(previousRoom);
        sendParticipants(previousRoom);
        socket.to(previousRoom).emit("cursor-left", { id: socket.id });
      }

      // Assign socket session room data
      socket.data.roomId = room;
      socket.data.classroomId = classroom.id;
      socket.data.boardId = boardId;
      socket.data.role = userRole;
      socket.data.isClassroomTeacher = isTeacher;
      socket.join(room);

      // Fast board-state synchronization:
      // If room already has in-memory drawing elements, serve them directly (0ms)
      let segments = roomSegmentsCache.get(room);
      if (!segments) {
        try {
          const { data: elementRows, error: elementsError } = await supabaseAdmin
            .from("board_elements")
            .select("stroke_id, kind, data, sequence_order")
            .eq("board_id", boardId)
            .eq("is_deleted", false)
            .order("sequence_order", { ascending: true });

          if (elementsError) {
            console.warn("Fetch board elements notice:", elementsError.message);
          }

          segments = (elementRows || []).map((row) => ({
            ...row.data,
            kind: row.kind,
            strokeId: row.stroke_id,
          }));
        } catch (fetchErr) {
          console.warn("Fetch board elements exception:", fetchErr.message);
          segments = [];
        }
        roomSegmentsCache.set(room, segments);
      }

      // Load recent chat messages from PostgreSQL
      let formattedChat = [];
      try {
        const { data: chatRows, error: chatError } = await supabaseAdmin
          .from("chat_messages")
          .select("id, sender_name, message, created_at")
          .eq("classroom_id", classroom.id)
          .order("created_at", { ascending: true })
          .limit(100);

        if (!chatError && chatRows) {
          formattedChat = chatRows.map((msg) => ({
            id: msg.id,
            username: msg.sender_name,
            message: msg.message,
            time: msg.created_at,
          }));
        }
      } catch (chatErr) {
        console.warn("Chat fetch notice:", chatErr.message);
      }

      // Read moderation states
      const isChatDisabled = Boolean(roomChatDisabledCache.get(room));
      const lockedStudents = roomLockedStudentsCache.get(room);
      const isIndividuallyLocked = Boolean(lockedStudents && lockedStudents.has(socket.data.userId));

      // Notify connecting socket of current state immediately
      socket.emit("board-state", segments);
      socket.emit("room-role", {
        role: userRole,
        boardLocked,
        isChatDisabled,
        isIndividuallyLocked,
        classroomName: classroom.name,
      });
      socket.emit("chat-history", formattedChat);

      // Update room participants
      sendParticipants(room);

      callback?.({
        success: true,
        roomId: room,
        role: userRole,
        boardLocked,
        isChatDisabled,
        isIndividuallyLocked,
        classroomName: classroom.name,
      });
    } catch (error) {
      console.error("Join room error:", error.message);
      callback?.({ error: "Could not join classroom. Please try again." });
    }
  });

  // Leave Classroom Room
  socket.on("leave-room", (callback) => {
    const room = socket.data.roomId;
    if (!room) return callback?.({ success: true });

    socket.leave(room);
    socket.to(room).emit("cursor-left", { id: socket.id });
    socket.data.roomId = null;
    socket.data.classroomId = null;
    socket.data.boardId = null;
    sendParticipants(room);
    callback?.({ success: true });
  });

  // Ephemeral Cursor Movement (never persisted to DB)
  socket.on("cursor-move", ({ roomId, x, y } = {}) => {
    const room = validRoom(socket, roomId);
    if (!room || !Number.isFinite(x) || !Number.isFinite(y)) return;

    socket.to(room).emit("cursor-update", {
      id: socket.id,
      username: socket.data.username || "Student",
      role: socket.data.role || "student",
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    });
  });

  // Draw Segment (Stroke / Shape / Text)
  socket.on("draw", (payload = {}) => {
    try {
      const { roomId, segment } = payload;
      const room = validRoom(socket, roomId);
      if (!room || !segment || typeof segment !== "object") return;

      // In-memory instant lock check (0ms latency, zero database calls)
      const isLocked = Boolean(roomLockCache.get(room));
      const lockedStudents = roomLockedStudentsCache.get(room);
      const isIndividuallyLocked = Boolean(lockedStudents && lockedStudents.has(socket.data.userId));
      if ((isLocked || isIndividuallyLocked) && !socket.data.isClassroomTeacher) {
        socket.emit("board-error", {
          message: isIndividuallyLocked
            ? "Your whiteboard drawing has been locked by the teacher."
            : "The teacher has locked the board.",
        });
        return;
      }

      // Input Validation
      const kind = segment.kind || "stroke";
      const numeric = ["x0", "y0"].every((key) => Number.isFinite(segment[key]));
      const shapeNumeric = kind !== "shape" || ["x1", "y1"].every((key) => Number.isFinite(segment[key]));
      if (!numeric || !shapeNumeric || !["stroke", "shape", "text"].includes(kind)) return;
      if (kind !== "text" && (!Number.isFinite(segment.width) || segment.width < 1 || segment.width > 100)) return;
      if (kind === "shape" && !["rect", "circle", "arrow", "line"].includes(segment.shape)) return;
      if (kind === "text" && (typeof segment.text !== "string" || !segment.text.trim() || segment.text.length > 240)) return;

      for (const key of ["x0", "y0", "x1", "y1"]) {
        if (segment[key] !== undefined && (segment[key] < 0 || segment[key] > 1)) return;
      }

      const safeSegment = {
        ...segment,
        kind,
        color: typeof segment.color === "string" && /^#[0-9a-fA-F]{6}$/.test(segment.color) ? segment.color : "#2563eb",
        width: Math.min(100, Math.max(1, Number(segment.width) || 3)),
        strokeId: typeof segment.strokeId === "string" ? segment.strokeId.slice(0, 80) : `${socket.id}-${Date.now()}`,
        createdBy: socket.data.username || "Student",
        userId: socket.data.userId,
      };

      // 1. BROADCAST IMMEDIATELY to peers in room (0ms latency)
      socket.to(room).emit("draw", safeSegment);

      // 2. Cache stroke in memory immediately (0ms latency)
      let roomSegments = roomSegmentsCache.get(room);
      if (!roomSegments) {
        roomSegments = [];
        roomSegmentsCache.set(room, roomSegments);
      }
      roomSegments.push(safeSegment);

      // Reset redo stack on new drawing action
      redoStacks.set(room, []);

      // 3. Queue for background batch persistence to Supabase (non-blocking)
      const boardId = socket.data.boardId || roomBoardIdCache.get(room);
      if (boardId) {
        queueSegmentForPersistence(room, boardId, safeSegment);
      }
    } catch (error) {
      console.error("Save drawing error:", error.message);
    }
  });

  // Undo Board Change (Teacher only)
  socket.on("undo-board", ({ roomId } = {}) => {
    try {
      const room = validRoom(socket, roomId);
      if (!room) return;

      if (!socket.data.isClassroomTeacher) {
        socket.emit("board-error", { message: "Only the teacher can undo board changes." });
        return;
      }

      const segments = roomSegmentsCache.get(room) || [];
      if (segments.length === 0) return;

      // Find the most recent strokeId
      const lastStrokeId = segments[segments.length - 1].strokeId;

      // Partition segments into active and undone
      const updatedSegments = [];
      const undoneSegments = [];
      for (const seg of segments) {
        if (seg.strokeId === lastStrokeId) {
          undoneSegments.push(seg);
        } else {
          updatedSegments.push(seg);
        }
      }
      roomSegmentsCache.set(room, updatedSegments);

      // Push to redo stack
      let redoStack = redoStacks.get(room) || [];
      redoStack.push({ strokeId: lastStrokeId, segments: undoneSegments });
      redoStacks.set(room, redoStack);

      // Broadcast new board state to all room participants immediately (0ms)
      io.to(room).emit("board-state", updatedSegments);

      // Soft-delete in Supabase PostgreSQL in background
      const boardId = socket.data.boardId || roomBoardIdCache.get(room);
      if (boardId) {
        supabaseAdmin
          .from("board_elements")
          .update({ is_deleted: true })
          .eq("board_id", boardId)
          .eq("stroke_id", lastStrokeId)
          .then(({ error }) => {
            if (error) console.warn("[Supabase Undo notice]:", error.message);
          })
          .catch((err) => console.warn("[Supabase Undo exception]:", err.message));
      }
    } catch (error) {
      console.error("Undo error:", error.message);
      socket.emit("board-error", { message: "Undo failed." });
    }
  });

  // Redo Board Change (Teacher only)
  socket.on("redo-board", ({ roomId } = {}) => {
    try {
      const room = validRoom(socket, roomId);
      if (!room) return;

      if (!socket.data.isClassroomTeacher) {
        socket.emit("board-error", { message: "Only the teacher can redo board changes." });
        return;
      }

      let redoStack = redoStacks.get(room) || [];
      if (redoStack.length === 0) return;

      const restoredItem = redoStack.pop();
      redoStacks.set(room, redoStack);

      const segments = roomSegmentsCache.get(room) || [];
      const updatedSegments = [...segments, ...(restoredItem.segments || [])];
      roomSegmentsCache.set(room, updatedSegments);

      // Broadcast restored board state to all room participants immediately (0ms)
      io.to(room).emit("board-state", updatedSegments);

      // Restore in Supabase PostgreSQL in background
      const boardId = socket.data.boardId || roomBoardIdCache.get(room);
      if (boardId && restoredItem.strokeId) {
        supabaseAdmin
          .from("board_elements")
          .update({ is_deleted: false })
          .eq("board_id", boardId)
          .eq("stroke_id", restoredItem.strokeId)
          .then(({ error }) => {
            if (error) console.warn("[Supabase Redo notice]:", error.message);
          })
          .catch((err) => console.warn("[Supabase Redo exception]:", err.message));
      }
    } catch (error) {
      console.error("Redo error:", error.message);
      socket.emit("board-error", { message: "Redo failed." });
    }
  });

  // Clear Board (Teacher only)
  socket.on("clear-board", ({ roomId } = {}) => {
    try {
      const room = validRoom(socket, roomId);
      if (!room) return;

      if (!socket.data.isClassroomTeacher) {
        socket.emit("board-error", { message: "Only the teacher can clear the board." });
        return;
      }

      roomSegmentsCache.set(room, []);
      redoStacks.set(room, []);

      // Broadcast cleared board to all room participants immediately (0ms)
      io.to(room).emit("board-cleared");

      // Mark elements as deleted in Supabase in background
      const boardId = socket.data.boardId || roomBoardIdCache.get(room);
      if (boardId) {
        supabaseAdmin
          .from("board_elements")
          .update({ is_deleted: true })
          .eq("board_id", boardId)
          .then(({ error }) => {
            if (error) console.warn("[Supabase Clear notice]:", error.message);
          })
          .catch((err) => console.warn("[Supabase Clear exception]:", err.message));
      }
    } catch (error) {
      console.error("Clear board error:", error.message);
      socket.emit("board-error", { message: "Board could not be cleared." });
    }
  });

  // Lock / Unlock Board (Teacher only)
  socket.on("set-board-lock", ({ roomId, locked } = {}) => {
    try {
      const room = validRoom(socket, roomId);
      if (!room || !socket.data.isClassroomTeacher || typeof locked !== "boolean") return;

      // Update in-memory lock state immediately
      roomLockCache.set(room, locked);

      // Broadcast lock state to all room participants immediately (0ms)
      io.to(room).emit("board-lock-state", { locked });

      // Persist lock status to Supabase in background
      if (socket.data.classroomId) {
        supabaseAdmin
          .from("classrooms")
          .update({
            is_locked: locked,
            updated_at: new Date().toISOString(),
          })
          .eq("id", socket.data.classroomId)
          .then(({ error }) => {
            if (error) console.warn("[Supabase Lock notice]:", error.message);
          })
          .catch((err) => console.warn("[Supabase Lock exception]:", err.message));
      }
    } catch (error) {
      console.error("Lock error:", error.message);
    }
  });

  // Chat Message (Classroom members only)
  socket.on("chat-message", ({ roomId, message } = {}) => {
    try {
      const room = validRoom(socket, roomId);
      if (!room || typeof message !== "string") return;

      // Enforce room chat pause (teacher can still send messages/announcements)
      const isChatDisabled = Boolean(roomChatDisabledCache.get(room));
      if (isChatDisabled && !socket.data.isClassroomTeacher) {
        socket.emit("board-error", { message: "Chat has been stopped by the teacher." });
        return;
      }

      const text = message.trim();
      if (!text || text.length > 500) return;

      const classroomId = socket.data.classroomId;
      if (!classroomId) return;

      const chatItem = {
        id: crypto.randomUUID(),
        username: socket.data.username || "Student",
        message: text,
        time: new Date().toISOString(),
      };

      // Broadcast message to all room participants immediately (0ms)
      io.to(room).emit("chat-message", chatItem);

      // Persist message to Supabase chat_messages in background
      supabaseAdmin
        .from("chat_messages")
        .insert({
          classroom_id: classroomId,
          user_id: socket.data.userId,
          sender_name: chatItem.username,
          message: text,
        })
        .then(({ error }) => {
          if (error) console.warn("[Supabase Chat notice]:", error.message);
        })
        .catch((err) => console.warn("[Supabase Chat exception]:", err.message));
    } catch (error) {
      console.error("Save chat error:", error.message);
      socket.emit("board-error", { message: "Chat message could not be saved." });
    }
  });

  // Stop / Resume Chat (Teacher only)
  socket.on("set-chat-status", ({ roomId, isChatDisabled } = {}) => {
    try {
      const room = validRoom(socket, roomId);
      if (!room || !socket.data.isClassroomTeacher || typeof isChatDisabled !== "boolean") return;

      roomChatDisabledCache.set(room, isChatDisabled);
      io.to(room).emit("chat-status-updated", { isChatDisabled });
    } catch (error) {
      console.error("Chat status error:", error.message);
    }
  });

  // Individual Student Board Lock / Unlock (Teacher only)
  socket.on("set-student-board-lock", ({ roomId, targetUserId, locked } = {}) => {
    try {
      const room = validRoom(socket, roomId);
      if (!room || !socket.data.isClassroomTeacher || !targetUserId || typeof locked !== "boolean") return;

      let lockedStudents = roomLockedStudentsCache.get(room);
      if (!lockedStudents) {
        lockedStudents = new Set();
        roomLockedStudentsCache.set(room, lockedStudents);
      }

      if (locked) {
        lockedStudents.add(targetUserId);
      } else {
        lockedStudents.delete(targetUserId);
      }

      // Notify the target user socket(s) in this room
      const roomSockets = [...(io.sockets.adapter.rooms.get(room) || [])];
      for (const socketId of roomSockets) {
        const client = io.sockets.sockets.get(socketId);
        if (client && client.data.userId === targetUserId) {
          client.emit("student-lock-state", { isBoardLocked: locked });
        }
      }

      // Broadcast updated participants list with individual lock state badges
      sendParticipants(room);
    } catch (error) {
      console.error("Set student lock error:", error.message);
    }
  });

  // Kick / Remove Student from Classroom (Teacher only)
  socket.on("kick-student", ({ roomId, targetSocketId, targetUserId } = {}) => {
    try {
      const room = validRoom(socket, roomId);
      if (!room || !socket.data.isClassroomTeacher) {
        socket.emit("board-error", { message: "Only the teacher can remove students." });
        return;
      }

      if (!targetSocketId && !targetUserId) return;

      // Add targetUserId to kicked users cache for this room session
      if (targetUserId) {
        let kickedSet = roomKickedUsersCache.get(room);
        if (!kickedSet) {
          kickedSet = new Set();
          roomKickedUsersCache.set(room, kickedSet);
        }
        kickedSet.add(targetUserId);
      }

      // Find target socket(s) in this room
      const roomSockets = [...(io.sockets.adapter.rooms.get(room) || [])];
      for (const sid of roomSockets) {
        const client = io.sockets.sockets.get(sid);
        if (client && (client.id === targetSocketId || (targetUserId && client.data.userId === targetUserId))) {
          // Notify the student that they have been removed
          client.emit("kicked-from-room", {
            reason: "The teacher has removed you from this classroom session.",
          });
          client.leave(room);
          client.data.roomId = null;
          client.data.classroomId = null;
          client.data.boardId = null;
        }
      }

      // Immediately broadcast updated participant list to remaining room members
      sendParticipants(room);
      socket.emit("board-error", { message: "Student removed from classroom session." });
    } catch (error) {
      console.error("Kick student error:", error.message);
    }
  });

  // Disconnection handler
  socket.on("disconnect", () => {
    const room = socket.data.roomId;
    if (room) {
      socket.to(room).emit("cursor-left", { id: socket.id });
      setTimeout(() => sendParticipants(room), 0);
    }
  });
});

// ==============================================================================
// Server Startup & Optional MongoDB Dual-Mode Support
// ==============================================================================
const PORT = process.env.PORT || 5000;

async function startServer() {
  // If MongoDB URI is supplied, connect for migration capability
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("[MongoDB] Connected successfully for legacy data and migration tools.");
    } catch (err) {
      console.warn("[MongoDB Warning] Could not connect to MongoDB URI. Supabase will serve as primary database.", err.message);
    }
  } else {
    console.log("[Notice] MONGODB_URI not set. Running purely on Supabase PostgreSQL.");
  }

  server.listen(PORT, () => {
    console.log(`[CollabBoard Server] Running on http://localhost:${PORT}`);
    console.log(`[CollabBoard Server] Supabase integration active.`);
  });
}

startServer();

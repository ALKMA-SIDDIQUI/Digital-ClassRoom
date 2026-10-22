import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../../context/useAuth";
import { supabase } from "../../lib/supabase";

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
const buttonBase = "rounded-lg px-3 py-2 text-sm font-semibold transition";
const buttonOn = "bg-blue-600 text-white";
const buttonOff = "border border-slate-200 bg-white hover:bg-slate-50";

function isImageFile(mimeType, fileName = "") {
  if (mimeType && mimeType.startsWith("image/")) return true;
  const ext = fileName.toLowerCase().split(".").pop();
  return ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext);
}

function isPdfFile(mimeType, fileName = "") {
  if (mimeType === "application/pdf") return true;
  return fileName.toLowerCase().endsWith(".pdf");
}

function getFileBadge(mimeType, fileName = "") {
  if (isImageFile(mimeType, fileName)) return { label: "IMG", bg: "bg-emerald-100 text-emerald-700", icon: "🖼️" };
  if (isPdfFile(mimeType, fileName)) return { label: "PDF", bg: "bg-rose-100 text-rose-700", icon: "📄" };
  const ext = fileName.toLowerCase().split(".").pop();
  if (["doc", "docx", "txt", "rtf", "odt"].includes(ext)) return { label: "DOC", bg: "bg-blue-100 text-blue-700", icon: "📝" };
  if (["xls", "xlsx", "csv"].includes(ext)) return { label: "SHEET", bg: "bg-amber-100 text-amber-700", icon: "📊" };
  if (["ppt", "pptx"].includes(ext)) return { label: "SLIDE", bg: "bg-orange-100 text-orange-700", icon: "📑" };
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return { label: "ARCH", bg: "bg-purple-100 text-purple-700", icon: "📦" };
  return { label: "FILE", bg: "bg-slate-200 text-slate-700", icon: "📎" };
}

function drawItem(ctx, item, width, height) {
  if (!item) return;
  const x0 = (item.x0 ?? 0) * width;
  const y0 = (item.y0 ?? 0) * height;
  const x1 = (item.x1 ?? item.x0 ?? 0) * width;
  const y1 = (item.y1 ?? item.y0 ?? 0) * height;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = item.tool === "eraser" ? "#ffffff" : (item.color || "#2563eb");
  ctx.fillStyle = item.color || "#2563eb";
  ctx.lineWidth = Math.max(1, Number(item.width) || 3);

  if (item.kind === "text") {
    ctx.fillStyle = item.color || "#2563eb";
    ctx.font = `${Math.max(12, Number(item.fontSize) || 22)}px Arial, sans-serif`;
    ctx.textBaseline = "top";
    const lines = String(item.text || "").split("\n").slice(0, 8);
    lines.forEach((line, index) =>
      ctx.fillText(line.slice(0, 120), x0, y0 + index * ((Number(item.fontSize) || 22) * 1.25))
    );
  } else if (item.kind === "shape") {
    ctx.beginPath();
    if (item.shape === "rect") {
      ctx.rect(x0, y0, x1 - x0, y1 - y0);
      ctx.stroke();
    } else if (item.shape === "circle") {
      const rx = (x1 - x0) / 2;
      const ry = (y1 - y0) / 2;
      ctx.ellipse(x0 + rx, y0 + ry, Math.max(0.5, Math.abs(rx)), Math.max(0.5, Math.abs(ry)), 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (item.shape === "arrow") {
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      const angle = Math.atan2(y1 - y0, x1 - x0);
      const head = Math.max(10, (Number(item.width) || 3) * 4);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - head * Math.cos(angle - Math.PI / 6), y1 - head * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - head * Math.cos(angle + Math.PI / 6), y1 - head * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    } else {
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
  ctx.restore();
}

export default function Whiteboard({ roomId, initialRole, classroomName, onLeaveRoom }) {
  const { profile, user, accessToken } = useAuth();
  const currentUsername = profile?.full_name || "User";

  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const channelRef = useRef(null);
  const segmentsRef = useRef([]);
  const drawingRef = useRef(false);
  const startPointRef = useRef(null);
  const activeStrokeRef = useRef(null);
  const cursorThrottleRef = useRef(0);
  const initialShapePointRef = useRef(null);
  const latestPointRef = useRef(null);

  const [role, setRole] = useState(initialRole || "student");
  const isTeacher = role === "teacher";
  const [status, setStatus] = useState("🟢 Connecting to live classroom...");
  const [boardLocked, setBoardLocked] = useState(false);

  // Whiteboard Tools
  const [color, setColor] = useState("#2563eb");
  const [size, setSize] = useState(4);
  const [tool, setTool] = useState("pen"); // "pen" | "eraser" | "line" | "shape" | "text"
  const [shape, setShape] = useState("rect"); // "rect" | "circle" | "arrow"
  const [textInput, setTextInput] = useState("Hello class!");
  const [fontSize, setFontSize] = useState(22);
  const [preview, setPreview] = useState(null);
  const [revision, setRevision] = useState(0);

  const clientSessionIdRef = useRef(
    `sess_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`
  );
  const fileInputRef = useRef(null);

  // Teacher Moderation & Student Permissions
  const [isChatDisabled, setIsChatDisabled] = useState(false);
  const [isIndividuallyLocked, setIsIndividuallyLocked] = useState(false);
  const [kickedModal, setKickedModal] = useState(null); // { reason: string }

  // Unified drawing lock (global room lock OR individual student lock)
  const isDrawingLocked = !isTeacher && (boardLocked || isIndividuallyLocked);

  // Collaboration State
  const [socketClientId, setSocketClientId] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [cursors, setCursors] = useState({});

  // Classroom Resources (Supabase Storage)
  const [sidebarTab, setSidebarTab] = useState("chat"); // "chat" | "participants" | "resources"
  const [resources, setResources] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewModal, setPreviewModal] = useState(null);

  const [participants, setParticipants] = useState([
    {
      id: clientSessionIdRef.current,
      clientSessionId: clientSessionIdRef.current,
      userId: user?.id || clientSessionIdRef.current,
      username: currentUsername,
      role: initialRole,
      isBoardLocked: false,
    },
  ]);

  // Ensure current user is always properly reflected in participants
  useEffect(() => {
    setParticipants((prev) => {
      const myKey = user?.id || clientSessionIdRef.current;
      const exists = prev.some((p) => (p.userId || p.clientSessionId || p.id) === myKey);
      const myObj = {
        id: clientSessionIdRef.current,
        clientSessionId: clientSessionIdRef.current,
        userId: user?.id || clientSessionIdRef.current,
        username: currentUsername,
        role: initialRole,
        isBoardLocked: Boolean(isIndividuallyLocked),
      };
      if (exists) {
        return prev.map((p) =>
          (p.userId || p.clientSessionId || p.id) === myKey ? { ...p, ...myObj } : p
        );
      }
      return [myObj, ...prev];
    });
  }, [user?.id, currentUsername, initialRole, isIndividuallyLocked]);

  // Helper to reliably retrieve valid access token
  const getValidToken = useCallback(async () => {
    if (accessToken) return accessToken;
    try {
      const { data } = await supabase.auth.getSession();
      return data?.session?.access_token || null;
    } catch (err) {
      console.warn("Session check notice:", err?.message);
      return null;
    }
  }, [accessToken]);

  // Render Whiteboard Canvas
  const renderBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = window.devicePixelRatio || 1;
    const targetWidth = Math.round(rect.width * dpr);
    const targetHeight = Math.round(rect.height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    segmentsRef.current.forEach((item) => drawItem(ctx, item, rect.width, rect.height));
  }, []);

  useEffect(() => {
    renderBoard();
  }, [renderBoard, revision]);

  // Load Classroom Information & Active Teacher from DB
  useEffect(() => {
    let isMounted = true;
    async function loadClassroomDetails() {
      if (!roomId) return;
      try {
        const cleanCode = roomId.trim().toUpperCase();
        const { data: classroom, error } = await supabase
          .from("classrooms")
          .select("id, name, teacher_id, is_locked, profiles:teacher_id(id, full_name, role)")
          .eq("room_code", cleanCode)
          .maybeSingle();

        if (error || !classroom) return;

        if (isMounted) {
          if (typeof classroom.is_locked === "boolean") {
            setBoardLocked(classroom.is_locked);
          }

          // If official teacher exists, ensure teacher is displayed in participants
          if (classroom.profiles) {
            const teacherProfile = Array.isArray(classroom.profiles) ? classroom.profiles[0] : classroom.profiles;
            const teacherId = teacherProfile?.id;
            if (teacherId) {
              setParticipants((prev) => {
                const exists = prev.some((p) => (p.userId || p.id) === teacherId);
                if (exists) return prev;
                const teacherObj = {
                  id: teacherId,
                  userId: teacherId,
                  username: teacherProfile.full_name || "Teacher",
                  role: "teacher",
                  isBoardLocked: false,
                };
                return [teacherObj, ...prev];
              });
            }
          }
        }
      } catch (err) {
        console.warn("loadClassroomDetails notice:", err?.message);
      }
    }

    loadClassroomDetails();
    return () => {
      isMounted = false;
    };
  }, [roomId]);

  // Load Resources directly from Supabase Storage & PostgreSQL on mount / room change
  const fetchRoomResources = useCallback(async () => {
    if (!roomId) return;
    try {
      const cleanCode = roomId.trim().toUpperCase();
      const { data: classroom, error: classErr } = await supabase
        .from("classrooms")
        .select("id")
        .eq("room_code", cleanCode)
        .maybeSingle();

      if (classErr || !classroom?.id) return;

      const { data: dbResources, error: dbErr } = await supabase
        .from("classroom_resources")
        .select("id, classroom_id, uploader_id, file_name, file_path, file_size, mime_type, created_at, profiles:uploader_id(full_name)")
        .eq("classroom_id", classroom.id)
        .order("created_at", { ascending: false });

      if (dbErr) {
        console.warn("fetchRoomResources error:", dbErr.message);
        return;
      }

      const enriched = (dbResources || []).map((item) => {
        const { data: pubData } = supabase.storage
          .from("classroom-resources")
          .getPublicUrl(item.file_path);
        const url = pubData?.publicUrl || "";
        return {
          ...item,
          publicUrl: url,
          downloadUrl: url,
        };
      });

      setResources(enriched);
    } catch (err) {
      console.warn("fetchRoomResources notice:", err?.message);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoomResources();
  }, [fetchRoomResources]);

  // Handle Resource Upload directly to Supabase Storage
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");

    if (file.size > 25 * 1024 * 1024) {
      setUploadError("File is too large! Maximum limit is 25MB.");
      return;
    }

    try {
      setUploading(true);
      const cleanCode = roomId.trim().toUpperCase();

      // 1. Get Classroom ID
      const { data: classroom, error: classErr } = await supabase
        .from("classrooms")
        .select("id")
        .eq("room_code", cleanCode)
        .maybeSingle();

      if (classErr || !classroom?.id) {
        throw new Error("Classroom not found for file upload. Please verify the room code.");
      }

      // 2. Upload file directly to Supabase Storage bucket 'classroom-resources'
      const sanitizedName = (file.name || "unnamed_file").replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${classroom.id}/${Date.now()}-${sanitizedName}`;

      const { error: uploadErr } = await supabase.storage
        .from("classroom-resources")
        .upload(storagePath, file, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (uploadErr) {
        throw new Error(`Storage upload failed: ${uploadErr.message}`);
      }

      // 3. Resolve permanent Public URL
      const { data: pubData } = supabase.storage
        .from("classroom-resources")
        .getPublicUrl(storagePath);
      const publicUrl = pubData?.publicUrl || "";

      // 4. Save file metadata in PostgreSQL classroom_resources
      const { data: inserted, error: insertErr } = await supabase
        .from("classroom_resources")
        .insert({
          classroom_id: classroom.id,
          uploader_id: user?.id || null,
          file_name: file.name,
          file_path: storagePath,
          file_size: file.size,
          mime_type: file.type || "application/octet-stream",
        })
        .select("id, classroom_id, uploader_id, file_name, file_path, file_size, mime_type, created_at, profiles:uploader_id(full_name)")
        .single();

      if (insertErr) {
        throw new Error(`Failed to save file details: ${insertErr.message}`);
      }

      const newResource = {
        ...inserted,
        publicUrl,
        downloadUrl: publicUrl,
      };

      // 5. Update local state immediately
      setResources((prev) => [newResource, ...prev.filter((r) => r.id !== newResource.id)]);
      setStatus(`Resource "${file.name}" uploaded successfully!`);

      // 6. Broadcast to ALL participants in the room via Supabase Realtime channel
      channelRef.current?.send({
        type: "broadcast",
        event: "resource-uploaded",
        payload: newResource,
      });

      // Also notify socket if available
      socketRef.current?.emit("resource-uploaded", newResource);
    } catch (err) {
      console.error("handleFileUpload error:", err);
      setUploadError(err.message || "Failed to upload file.");
      setStatus(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Resource Deletion directly via Supabase Storage
  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      const resourceToDelete = resources.find((r) => r.id === resourceId);
      if (resourceToDelete?.file_path) {
        await supabase.storage.from("classroom-resources").remove([resourceToDelete.file_path]);
      }
      const { error } = await supabase.from("classroom_resources").delete().eq("id", resourceId);
      if (error) throw error;

      setResources((prev) => prev.filter((r) => r.id !== resourceId));
      setStatus("Resource removed.");

      // Broadcast deletion
      channelRef.current?.send({
        type: "broadcast",
        event: "resource-deleted",
        payload: { resourceId },
      });
      socketRef.current?.emit("resource-deleted", { resourceId });
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  // 1. Supabase Realtime Cloud Sync (Zero-config WebSockets directly via Supabase)
  useEffect(() => {
    let isMounted = true;
    const channelName = `classroom:${roomId}`;
    const mySessionId = clientSessionIdRef.current;

    const myData = {
      id: mySessionId,
      clientSessionId: mySessionId,
      userId: user?.id || mySessionId,
      username: currentUsername || "Participant",
      role: initialRole || "student",
      isBoardLocked: false,
    };

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: mySessionId },
      },
    });
    channelRef.current = channel;

    // Drawing sync
    channel.on("broadcast", { event: "draw" }, ({ payload }) => {
      if (!isMounted || !payload) return;
      segmentsRef.current.push(payload);
      setRevision((n) => n + 1);
    });

    // Clear board sync
    channel.on("broadcast", { event: "clear-board" }, () => {
      if (!isMounted) return;
      segmentsRef.current = [];
      setRevision((n) => n + 1);
    });

    // Board state / undo sync
    channel.on("broadcast", { event: "board-state" }, ({ payload }) => {
      if (!isMounted) return;
      segmentsRef.current = Array.isArray(payload) ? payload : [];
      setRevision((n) => n + 1);
    });

    // Board lock sync
    channel.on("broadcast", { event: "board-lock-state" }, ({ payload }) => {
      if (!isMounted || typeof payload?.locked !== "boolean") return;
      setBoardLocked(payload.locked);
    });

    // Individual student lock sync
    channel.on("broadcast", { event: "student-lock-state" }, ({ payload }) => {
      if (!isMounted || payload?.targetUserId !== user?.id) return;
      if (typeof payload?.locked === "boolean") {
        setIsIndividuallyLocked(payload.locked);
      }
    });

    // Chat status sync
    channel.on("broadcast", { event: "chat-status-updated" }, ({ payload }) => {
      if (!isMounted || typeof payload?.isChatDisabled !== "boolean") return;
      setIsChatDisabled(payload.isChatDisabled);
    });

    // Chat message sync
    channel.on("broadcast", { event: "chat-message" }, ({ payload }) => {
      if (!isMounted || !payload) return;
      setMessages((prev) => [...prev, payload].slice(-100));
    });

    // Cursor movement sync
    channel.on("broadcast", { event: "cursor-update" }, ({ payload }) => {
      if (!isMounted || !payload?.id || payload.id === user?.id || payload.id === mySessionId) return;
      setCursors((prev) => ({ ...prev, [payload.id]: payload }));
    });

    // Kicked from room sync
    channel.on("broadcast", { event: "kicked-from-room" }, ({ payload }) => {
      if (!isMounted || payload?.targetUserId !== user?.id) return;
      setKickedModal({ reason: payload?.reason || "You have been removed from the classroom session by the teacher." });
    });

    // Request board state from active participants
    channel.on("broadcast", { event: "request-board-state" }, () => {
      if (!isMounted || segmentsRef.current.length === 0) return;
      channel.send({
        type: "broadcast",
        event: "board-state",
        payload: segmentsRef.current,
      });
    });

    // Real-Time Resource Sync (files uploaded / deleted)
    channel.on("broadcast", { event: "resource-uploaded" }, ({ payload }) => {
      if (!isMounted || !payload?.id) return;
      setResources((prev) => [payload, ...prev.filter((r) => r.id !== payload.id)]);
      setStatus(`New file shared: ${payload.file_name}`);
    });

    channel.on("broadcast", { event: "resource-deleted" }, ({ payload }) => {
      if (!isMounted || !payload?.resourceId) return;
      setResources((prev) => prev.filter((r) => r.id !== payload.resourceId));
    });

    // Instant Peer Handshake: When someone announces joining, reply with own info
    channel.on("broadcast", { event: "peer-announce" }, ({ payload }) => {
      if (!isMounted || !payload || payload.clientSessionId === mySessionId) return;

      setParticipants((prev) => {
        const key = payload.userId || payload.clientSessionId || payload.id;
        const exists = prev.some((p) => (p.userId || p.clientSessionId || p.id) === key);
        if (exists) {
          return prev.map((p) =>
            (p.userId || p.clientSessionId || p.id) === key ? { ...p, ...payload } : p
          );
        }
        return [...prev, payload];
      });

      // Reply back with our info so the new participant immediately sees us
      channel.send({
        type: "broadcast",
        event: "peer-reply",
        payload: myData,
      });
    });

    channel.on("broadcast", { event: "peer-reply" }, ({ payload }) => {
      if (!isMounted || !payload || payload.clientSessionId === mySessionId) return;

      setParticipants((prev) => {
        const key = payload.userId || payload.clientSessionId || payload.id;
        const exists = prev.some((p) => (p.userId || p.clientSessionId || p.id) === key);
        if (exists) {
          return prev.map((p) =>
            (p.userId || p.clientSessionId || p.id) === key ? { ...p, ...payload } : p
          );
        }
        return [...prev, payload];
      });
    });

    channel.on("broadcast", { event: "peer-left" }, ({ payload }) => {
      if (!isMounted || !payload) return;
      const leaveKey = payload.userId || payload.clientSessionId || payload.id;
      setParticipants((prev) =>
        prev.filter((p) => (p.userId || p.clientSessionId || p.id) !== leaveKey)
      );
    });

    // Real-time Presence Sync
    const updatePresenceState = () => {
      if (!isMounted) return;
      const state = channel.presenceState();
      const onlineUsers = Object.values(state).flat().map((p) => ({
        id: p.clientSessionId || p.userId || p.id,
        clientSessionId: p.clientSessionId,
        userId: p.userId,
        username: p.username || "Participant",
        role: p.role || "student",
        isBoardLocked: Boolean(p.isBoardLocked),
      }));

      if (onlineUsers.length > 0) {
        setParticipants((prev) => {
          const map = new Map();
          // Keep current self
          map.set(myData.userId || myData.id, myData);
          // Add previous participants
          prev.forEach((p) => {
            const k = p.userId || p.clientSessionId || p.id;
            if (k) map.set(k, p);
          });
          // Merge newly detected online users
          onlineUsers.forEach((p) => {
            const k = p.userId || p.clientSessionId || p.id;
            if (k) map.set(k, p);
          });
          return Array.from(map.values());
        });
      }
    };

    channel.on("presence", { event: "sync" }, updatePresenceState);
    channel.on("presence", { event: "join" }, updatePresenceState);
    channel.on("presence", { event: "leave" }, updatePresenceState);

    channel.subscribe(async (subStatus) => {
      if (!isMounted) return;
      if (subStatus === "SUBSCRIBED") {
        try {
          await channel.track(myData);
        } catch (trackErr) {
          console.warn("Presence track notice:", trackErr);
        }
        setStatus(`🟢 Active in ${roomId} as ${initialRole}`);

        // Broadcast peer announcement
        channel.send({
          type: "broadcast",
          event: "peer-announce",
          payload: myData,
        });

        // Request board state from active peers
        channel.send({
          type: "broadcast",
          event: "request-board-state",
          payload: { requesterId: user?.id },
        });
      }
    });

    return () => {
      isMounted = false;
      try {
        channel.send({
          type: "broadcast",
          event: "peer-left",
          payload: { clientSessionId: mySessionId, userId: user?.id },
        });
        channel.unsubscribe();
      } catch {
        // ignore
      }
      channelRef.current = null;
    };
  }, [roomId, user?.id, currentUsername, initialRole]);

  // 2. Socket.IO Setup (Connects when dedicated backend server is available)
  useEffect(() => {
    let socket = null;
    try {
      socket = io(SOCKET_URL, {
        auth: { token: accessToken },
        transports: ["websocket", "polling"],
        timeout: 4000,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        setSocketClientId(socket.id);
        setStatus(`🟢 Active in ${roomId} as ${initialRole}`);
        socket.emit("join-room", { roomId }, (response) => {
          if (!response?.success) return;
          setRole(response.role);
          setBoardLocked(Boolean(response.boardLocked));
          setIsChatDisabled(Boolean(response.isChatDisabled));
          setIsIndividuallyLocked(Boolean(response.isIndividuallyLocked));
        });
      });

      socket.on("connect_error", () => {
        // Fallback to Supabase Realtime Channel without displaying websocket error
        setStatus(`🟢 Active in ${roomId} as ${initialRole}`);
      });

      socket.on("board-state", (items) => {
        segmentsRef.current = Array.isArray(items) ? items : [];
        setRevision((n) => n + 1);
      });

      socket.on("draw", (item) => {
        segmentsRef.current.push(item);
        setRevision((n) => n + 1);
      });

      socket.on("board-cleared", () => {
        segmentsRef.current = [];
        setRevision((n) => n + 1);
      });

      socket.on("participants-update", (updated) => {
        if (Array.isArray(updated) && updated.length > 0) {
          setParticipants(updated);
        }
      });

      socket.on("chat-history", (history) => {
        if (Array.isArray(history) && history.length > 0) {
          setMessages(history);
        }
      });

      socket.on("chat-message", (message) => {
        setMessages((old) => [...old, message].slice(-100));
      });

      socket.on("chat-status-updated", ({ isChatDisabled: chatOff }) => {
        setIsChatDisabled(Boolean(chatOff));
      });

      socket.on("student-lock-state", ({ isBoardLocked }) => {
        setIsIndividuallyLocked(Boolean(isBoardLocked));
      });

      socket.on("kicked-from-room", ({ reason }) => {
        setKickedModal({ reason: reason || "You have been removed from the classroom session by the teacher." });
      });

      socket.on("cursor-update", (cursor) => {
        setCursors((old) => ({ ...old, [cursor.id]: cursor }));
      });

      socket.on("cursor-left", ({ id }) => {
        setCursors((old) => {
          const next = { ...old };
          delete next[id];
          return next;
        });
      });

      socket.on("board-lock-state", ({ locked }) => {
        setBoardLocked(Boolean(locked));
      });
    } catch (err) {
      console.warn("Socket initialization notice:", err);
    }

    return () => {
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [roomId, accessToken, initialRole]);

  // Resize Observer for Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => renderBoard());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [renderBoard]);

  const getPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
  };

  const sendCursor = (event) => {
    const now = Date.now();
    if (now - cursorThrottleRef.current < 35) return;
    cursorThrottleRef.current = now;
    const point = getPoint(event);
    socketRef.current?.emit("cursor-move", { roomId, x: point.x, y: point.y });
    channelRef.current?.send({
      type: "broadcast",
      event: "cursor-update",
      payload: {
        id: user?.id || socketClientId || currentUsername,
        username: currentUsername,
        role: initialRole,
        x: point.x,
        y: point.y,
      },
    });
  };

  const addLocalItem = (item) => {
    segmentsRef.current.push(item);
    setRevision((n) => n + 1);
  };

  const addBoardItem = (item) => {
    addLocalItem(item);
    socketRef.current?.emit("draw", { roomId, segment: item });
    channelRef.current?.send({
      type: "broadcast",
      event: "draw",
      payload: item,
    });
  };

  const startDrawing = (event) => {
    if (isDrawingLocked || event.button !== 0) return;

    if (tool === "text") {
      event.preventDefault();
      const point = getPoint(event);
      const value = textInput.trim();
      if (!value) return setStatus("Enter text in the toolbar first.");
      const item = {
        kind: "text",
        text: value.slice(0, 240),
        x0: point.x,
        y0: point.y,
        color,
        width: Number(size),
        fontSize: Number(fontSize),
        strokeId: crypto.randomUUID(),
        createdBy: currentUsername,
      };
      addBoardItem(item);
      return;
    }

    event.preventDefault();
    const point = getPoint(event);
    drawingRef.current = true;
    startPointRef.current = point;
    activeStrokeRef.current = crypto.randomUUID();
    canvasRef.current?.setPointerCapture(event.pointerId);

    if (tool === "pen" || tool === "eraser") {
      const item = {
        kind: "stroke",
        x0: point.x,
        y0: point.y,
        x1: point.x,
        y1: point.y,
        color,
        width: Number(size),
        tool,
        strokeId: activeStrokeRef.current,
        createdBy: currentUsername,
      };
      addLocalItem(item);
      socketRef.current?.emit("draw", { roomId, segment: item });
      channelRef.current?.send({
        type: "broadcast",
        event: "draw",
        payload: item,
      });
    }
  };

  const draw = (event) => {
    sendCursor(event);
    if (!drawingRef.current || !startPointRef.current || isDrawingLocked) return;
    event.preventDefault();
    const next = getPoint(event);
    const start = startPointRef.current;
    const strokeId = activeStrokeRef.current;

    if (tool === "pen" || tool === "eraser") {
      const item = {
        kind: "stroke",
        x0: start.x,
        y0: start.y,
        x1: next.x,
        y1: next.y,
        color,
        width: Number(size),
        tool,
        strokeId,
        createdBy: currentUsername,
      };
      startPointRef.current = next;
      addBoardItem(item);
    } else if (tool === "line" || tool === "shape") {
      // Shape Preview overlay
      setPreview({
        kind: "shape",
        shape: tool === "line" ? "line" : shape,
        x0: start.x,
        y0: start.y,
        x1: next.x,
        y1: next.y,
        color,
        width: Number(size),
        strokeId,
      });
      startPointRef.current = next;
    }
  };

  const stopDrawing = () => {
    if (drawingRef.current && initialShapePointRef.current && activeStrokeRef.current && (tool === "line" || tool === "shape")) {
      const start = initialShapePointRef.current;
      const end = latestPointRef.current || start;
      const item = {
        kind: "shape",
        shape: tool === "line" ? "line" : shape,
        x0: start.x,
        y0: start.y,
        x1: end.x,
        y1: end.y,
        color,
        width: Number(size),
        strokeId: activeStrokeRef.current,
        createdBy: currentUsername,
      };
      addBoardItem(item);
    }

    drawingRef.current = false;
    startPointRef.current = null;
    activeStrokeRef.current = null;
    initialShapePointRef.current = null;
    latestPointRef.current = null;
    setPreview(null);
  };

  const beginCanvas = (event) => {
    if ((tool === "line" || tool === "shape") && !isDrawingLocked && event.button === 0) {
      const point = getPoint(event);
      initialShapePointRef.current = point;
      latestPointRef.current = point;
    }
    startDrawing(event);
  };

  const moveCanvas = (event) => {
    if (drawingRef.current && (tool === "line" || tool === "shape")) {
      latestPointRef.current = getPoint(event);
    }
    draw(event);
  };

  const clearBoard = () => {
    if (isTeacher) {
      segmentsRef.current = [];
      setRevision((n) => n + 1);
      socketRef.current?.emit("clear-board", { roomId });
      channelRef.current?.send({
        type: "broadcast",
        event: "clear-board",
        payload: {},
      });
    }
  };

  const undoBoard = () => {
    socketRef.current?.emit("undo-board", { roomId });
    if (segmentsRef.current.length > 0) {
      const lastStrokeId = segmentsRef.current[segmentsRef.current.length - 1]?.strokeId;
      if (lastStrokeId) {
        segmentsRef.current = segmentsRef.current.filter((item) => item.strokeId !== lastStrokeId);
      } else {
        segmentsRef.current.pop();
      }
      setRevision((n) => n + 1);
      channelRef.current?.send({
        type: "broadcast",
        event: "board-state",
        payload: segmentsRef.current,
      });
    }
  };

  const redoBoard = () => {
    socketRef.current?.emit("redo-board", { roomId });
  };

  const toggleBoardLock = () => {
    if (isTeacher) {
      const nextLocked = !boardLocked;
      setBoardLocked(nextLocked);
      socketRef.current?.emit("set-board-lock", { roomId, locked: nextLocked });
      channelRef.current?.send({
        type: "broadcast",
        event: "board-lock-state",
        payload: { locked: nextLocked },
      });
    }
  };

  // Toggle Chat Stopped/Active (Teacher only)
  const toggleChatStatus = () => {
    if (!isTeacher) return;
    const nextState = !isChatDisabled;
    setIsChatDisabled(nextState);
    socketRef.current?.emit("set-chat-status", { roomId, isChatDisabled: nextState });
    channelRef.current?.send({
      type: "broadcast",
      event: "chat-status-updated",
      payload: { isChatDisabled: nextState },
    });
    setStatus(nextState ? "Classroom chat stopped." : "Classroom chat resumed.");
  };

  // Toggle Individual Student Whiteboard Lock (Teacher only)
  const handleToggleStudentLock = (person) => {
    if (!isTeacher || !person) return;
    const nextLock = !person.isBoardLocked;
    const personKey = person.userId || person.id;
    setParticipants((prev) =>
      prev.map((p) => ((p.userId || p.id) === personKey ? { ...p, isBoardLocked: nextLock } : p))
    );
    socketRef.current?.emit("set-student-board-lock", {
      roomId,
      targetUserId: person.userId || person.id,
      locked: nextLock,
    });
    channelRef.current?.send({
      type: "broadcast",
      event: "student-lock-state",
      payload: { targetUserId: person.userId || person.id, locked: nextLock },
    });
    setStatus(`${nextLock ? "Locked" : "Unlocked"} whiteboard drawing for ${person.username}`);
  };

  // Kick / Remove Student from Classroom (Teacher only)
  const handleKickStudent = (person) => {
    if (!isTeacher || !person) return;
    const confirmed = window.confirm(
      `Are you sure you want to remove "${person.username}" from this classroom?`
    );
    if (!confirmed) return;

    const personKey = person.userId || person.id;
    setParticipants((prev) =>
      prev.filter((p) => (p.userId || p.id) !== personKey)
    );

    socketRef.current?.emit("kick-student", {
      roomId,
      targetSocketId: person.id,
      targetUserId: person.userId,
    });
    channelRef.current?.send({
      type: "broadcast",
      event: "kicked-from-room",
      payload: {
        targetUserId: person.userId || person.id,
        reason: "You have been removed from the classroom session by the teacher.",
      },
    });
    setStatus(`Removed ${person.username} from classroom.`);
  };

  const downloadBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `CollabBoard-${roomId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const sendMessage = (event) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message) return;
    const msgObj = {
      id: crypto.randomUUID(),
      username: currentUsername,
      sender: currentUsername,
      role: initialRole,
      message,
      text: message,
      time: new Date().toISOString(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, msgObj].slice(-100));
    socketRef.current?.emit("chat-message", { roomId, message });
    channelRef.current?.send({
      type: "broadcast",
      event: "chat-message",
      payload: msgObj,
    });
    setChatInput("");
  };

  const handleLeave = () => {
    try {
      channelRef.current?.send({
        type: "broadcast",
        event: "peer-left",
        payload: {
          clientSessionId: clientSessionIdRef.current,
          userId: user?.id,
        },
      });
      channelRef.current?.untrack();
      channelRef.current?.unsubscribe();
    } catch {
      // ignore
    }
    socketRef.current?.emit("leave-room", () => {
      onLeaveRoom();
    });
    onLeaveRoom();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Top Bar */}
      <header className="bg-slate-900 px-4 py-3 text-white shadow">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLeave}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold hover:bg-slate-700 transition"
            >
              ← Dashboard
            </button>
            <div>
              <h1 className="text-lg font-bold">{classroomName || "Classroom Whiteboard"}</h1>
              <p className="text-xs text-slate-400">Room Code: <strong className="text-white font-mono">{roomId}</strong></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300 hidden sm:inline">
              {status}
            </span>
            <span
              className={`rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                isTeacher ? "bg-violet-600 text-white" : "bg-blue-600 text-white"
              }`}
            >
              {isTeacher ? "🧑‍🏫 Teacher" : "🎓 Student"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Board Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 p-4 md:p-6">
        {/* Whiteboard Controls Toolbar */}
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(roomId);
                setStatus(`Copied room code ${roomId}`);
              }}
              className={`${buttonBase} ${buttonOff}`}
            >
              Copy Code
            </button>
            <button
              onClick={downloadBoard}
              className={`${buttonBase} bg-emerald-600 text-white hover:bg-emerald-700`}
            >
              Download PNG
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={undoBoard}
              disabled={!isTeacher}
              title={!isTeacher ? "Teacher only" : ""}
              className={`${buttonBase} ${
                isTeacher ? "bg-amber-500 text-white hover:bg-amber-600" : "cursor-not-allowed bg-slate-100 text-slate-400"
              }`}
            >
              ↶ Undo
            </button>
            <button
              onClick={redoBoard}
              disabled={!isTeacher}
              title={!isTeacher ? "Teacher only" : ""}
              className={`${buttonBase} ${
                isTeacher ? "bg-indigo-600 text-white hover:bg-indigo-700" : "cursor-not-allowed bg-slate-100 text-slate-400"
              }`}
            >
              ↷ Redo
            </button>
            {isTeacher && (
              <>
                <button
                  onClick={clearBoard}
                  className={`${buttonBase} bg-red-600 text-white hover:bg-red-700`}
                >
                  Clear Board
                </button>
                <button
                  onClick={toggleBoardLock}
                  className={`${buttonBase} ${boardLocked ? "bg-orange-600 text-white" : buttonOff}`}
                >
                  {boardLocked ? "Unlock Board" : "Lock Board"}
                </button>
              </>
            )}
          </div>
        </section>

        {/* Board & Sidebar Layout */}
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Canvas Section */}
          <section className="min-w-0 overflow-hidden rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
            {/* Tools Palette */}
            <div className={`mb-4 flex flex-wrap items-center gap-3 border-b border-slate-100 pb-3 transition ${isDrawingLocked ? "opacity-50 pointer-events-none" : ""}`}>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-600">
                Color
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border p-0.5"
                />
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-600">
                Size
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-20"
                />
                <span className="font-mono text-xs">{size}px</span>
              </label>

              <div className="flex flex-wrap gap-1.5">
                {[
                  ["pen", "Pen"],
                  ["eraser", "Eraser"],
                  ["line", "Line"],
                  ["shape", "Shape"],
                  ["text", "Text"],
                ].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setTool(val)}
                    className={`${buttonBase} ${tool === val ? buttonOn : buttonOff} text-xs py-1.5`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tool === "shape" && (
                <select
                  value={shape}
                  onChange={(e) => setShape(e.target.value)}
                  className="rounded-lg border border-slate-300 p-1.5 text-xs font-medium focus:outline-none"
                >
                  <option value="rect">Rectangle</option>
                  <option value="circle">Ellipse</option>
                  <option value="arrow">Arrow</option>
                </select>
              )}

              {tool === "text" && (
                <div className="flex flex-1 items-center gap-2 min-w-48">
                  <input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    maxLength={240}
                    placeholder="Text to stamp on canvas..."
                    className="flex-1 rounded-lg border border-slate-300 p-1.5 text-xs focus:outline-none"
                  />
                  <input
                    type="number"
                    min="12"
                    max="64"
                    value={fontSize}
                    onChange={(e) =>
                      setFontSize(Math.min(64, Math.max(12, Number(e.target.value) || 22)))
                    }
                    className="w-14 rounded-lg border border-slate-300 p-1.5 text-xs font-mono"
                  />
                </div>
              )}
            </div>

            {/* Lock Banners */}
            {isIndividuallyLocked && !isTeacher ? (
              <div className="mb-3 rounded-lg bg-rose-50 p-2.5 text-xs font-semibold text-rose-800 border border-rose-200 flex items-center gap-2">
                <span>🔒</span> Your whiteboard drawing access has been locked by the teacher. (View-only mode)
              </div>
            ) : boardLocked && !isTeacher ? (
              <div className="mb-3 rounded-lg bg-amber-50 p-2.5 text-xs font-medium text-amber-800 border border-amber-200 flex items-center gap-2">
                <span>🔒</span> The teacher has locked the board for everyone. Students currently have view-only access.
              </div>
            ) : null}

            {/* Canvas Container */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                onPointerDown={beginCanvas}
                onPointerMove={moveCanvas}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                onLostPointerCapture={stopDrawing}
                className={`h-[62vh] min-h-[380px] w-full rounded-xl border border-slate-200 bg-white touch-none ${
                  !isDrawingLocked ? "cursor-crosshair" : "cursor-not-allowed"
                }`}
              />

              {/* Dynamic Shape Preview */}
              {preview && (
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox="0 0 1000 600"
                  preserveAspectRatio="none"
                >
                  {preview.shape === "rect" && (
                    <rect
                      x={preview.x0 * 1000}
                      y={preview.y0 * 600}
                      width={(preview.x1 - preview.x0) * 1000}
                      height={(preview.y1 - preview.y0) * 600}
                      fill="none"
                      stroke={preview.color}
                      strokeWidth={preview.width}
                    />
                  )}
                  {preview.shape === "circle" && (
                    <ellipse
                      cx={(preview.x0 + preview.x1) * 500}
                      cy={(preview.y0 + preview.y1) * 300}
                      rx={Math.abs(preview.x1 - preview.x0) * 500}
                      ry={Math.abs(preview.y1 - preview.y0) * 300}
                      fill="none"
                      stroke={preview.color}
                      strokeWidth={preview.width}
                    />
                  )}
                  {(preview.shape === "line" || preview.shape === "arrow") && (
                    <line
                      x1={preview.x0 * 1000}
                      y1={preview.y0 * 600}
                      x2={preview.x1 * 1000}
                      y2={preview.y1 * 600}
                      stroke={preview.color}
                      strokeWidth={preview.width}
                    />
                  )}
                </svg>
              )}

              {/* Real-time Participant Cursors */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                {Object.values(cursors)
                  .filter((c) => c.id !== socketClientId)
                  .map((cursor) => (
                    <div
                      key={cursor.id}
                      className="absolute transition-all duration-75"
                      style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
                    >
                      <div className="h-3 w-3 -translate-x-1 -translate-y-1 rotate-45 bg-fuchsia-600 shadow" />
                      <span className="ml-2 rounded-full bg-fuchsia-600 px-2 py-0.5 text-[11px] font-bold text-white shadow">
                        {cursor.username}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </section>

          {/* Right Sidebar: Chat / Participants / Resources */}
          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              {/* Sidebar Tabs */}
              <div className="mb-3 flex rounded-lg bg-slate-100 p-1">
                <button
                  onClick={() => setSidebarTab("chat")}
                  className={`flex-1 rounded py-1.5 text-xs font-semibold transition ${
                    sidebarTab === "chat" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setSidebarTab("participants")}
                  className={`flex-1 rounded py-1.5 text-xs font-semibold transition ${
                    sidebarTab === "participants" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"
                  }`}
                >
                  People ({participants.length})
                </button>
                <button
                  onClick={() => setSidebarTab("resources")}
                  className={`flex-1 rounded py-1.5 text-xs font-semibold transition ${
                    sidebarTab === "resources" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"
                  }`}
                >
                  Files ({resources.length})
                </button>
              </div>

              {/* Chat View */}
              {sidebarTab === "chat" && (
                <div>
                  {/* Teacher Chat Moderation Header */}
                  <div className="mb-2 flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      💬 Classroom Chat
                      {isChatDisabled && (
                        <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                          STOPPED
                        </span>
                      )}
                    </span>
                    {isTeacher && (
                      <button
                        type="button"
                        onClick={toggleChatStatus}
                        className={`rounded px-2 py-0.5 text-[11px] font-bold transition flex items-center gap-1 ${
                          isChatDisabled
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
                        }`}
                        title={isChatDisabled ? "Resume classroom chat for students" : "Stop classroom chat for students"}
                      >
                        {isChatDisabled ? "▶️ Resume Chat" : "⏸️ Stop Chat"}
                      </button>
                    )}
                  </div>

                  {/* Chat Stopped Notice Banner */}
                  {isChatDisabled && (
                    <div className="mb-2 rounded-lg bg-rose-50 p-2 text-xs font-semibold text-rose-700 border border-rose-200 text-center">
                      🔇 Chat has been stopped by the teacher.
                    </div>
                  )}

                  <div className="mb-3 flex h-64 flex-col gap-2.5 overflow-y-auto rounded-xl bg-slate-50 p-3 border border-slate-100">
                    {messages.length === 0 ? (
                      <p className="m-auto text-xs text-slate-400 text-center">
                        No messages yet. Greet the classroom!
                      </p>
                    ) : (
                      messages.map((item, index) => {
                        const senderName = item.username || item.sender || "Participant";
                        const msgContent = item.message || item.text || "";
                        const displayTime =
                          item.timestamp ||
                          (item.time
                            ? new Date(item.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "");

                        return (
                          <div
                            key={item.id || `${item.time || index}-${index}`}
                            className="rounded-lg bg-white p-2 text-xs shadow-sm border border-slate-100"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-blue-600">{senderName}</span>
                              <span className="text-[10px] text-slate-400">{displayTime}</span>
                            </div>
                            <p className="text-slate-800 break-words">{msgContent}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      maxLength={500}
                      disabled={isChatDisabled && !isTeacher}
                      placeholder={
                        isChatDisabled
                          ? isTeacher
                            ? "Post announcement (chat paused for students)..."
                            : "Chat stopped by teacher..."
                          : "Type message..."
                      }
                      className="min-w-0 flex-1 rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                    <button
                      type="submit"
                      disabled={isChatDisabled && !isTeacher}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}

              {/* Participants View */}
              {sidebarTab === "participants" && (
                <div className="h-80 overflow-y-auto space-y-2 pr-0.5">
                  {participants.map((person) => {
                    const isSelf =
                      person.id === socketClientId ||
                      person.clientSessionId === clientSessionIdRef.current ||
                      (profile?.id && person.userId === profile.id);
                    const canModerate = isTeacher && !isSelf && person.role !== "teacher";

                    return (
                      <div
                        key={person.clientSessionId || person.id || person.userId}
                        className="rounded-lg bg-slate-50 p-2 border border-slate-100 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                              {person.username?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-medium text-slate-800 truncate block">
                                {person.username}
                                {isSelf ? " (You)" : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {person.isBoardLocked && (
                              <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700" title="Whiteboard drawing locked">
                                🔒 Locked
                              </span>
                            )}
                            <span
                              className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                person.role === "teacher"
                                  ? "bg-violet-100 text-violet-700"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {person.role}
                            </span>
                          </div>
                        </div>

                        {/* Teacher Moderation Controls for Students */}
                        {canModerate && (
                          <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-200/60">
                            <button
                              type="button"
                              onClick={() => handleToggleStudentLock(person)}
                              className={`rounded px-2 py-0.5 text-[10px] font-semibold transition border flex items-center gap-1 ${
                                person.isBoardLocked
                                  ? "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                              title={person.isBoardLocked ? "Unlock whiteboard for this student" : "Lock whiteboard for this student"}
                            >
                              {person.isBoardLocked ? "🔓 Unlock Board" : "🔒 Lock Board"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleKickStudent(person)}
                              className="rounded px-2 py-0.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1"
                              title="Remove student from classroom session"
                            >
                              🚫 Remove
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Classroom Resources / Supabase Storage View */}
              {sidebarTab === "resources" && (
                <div className="h-80 flex flex-col justify-between">
                  {/* Upload Error Alert */}
                  {uploadError && (
                    <div className="mb-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between">
                      <span className="truncate pr-1 font-medium">{uploadError}</span>
                      <button onClick={() => setUploadError("")} className="font-bold text-rose-900 text-sm hover:opacity-80 shrink-0">×</button>
                    </div>
                  )}

                  {/* Resource List */}
                  <div className="overflow-y-auto space-y-2 flex-1 mb-3 pr-1">
                    {resources.length === 0 ? (
                      <div className="text-center py-8 px-2">
                        <div className="text-3xl mb-2">📂</div>
                        <p className="text-xs font-semibold text-slate-700">No resources uploaded yet</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Upload class diagrams, lecture handouts, PDFs, or images below.
                        </p>
                      </div>
                    ) : (
                      resources.map((item) => {
                        const fileUrl = item.publicUrl || item.downloadUrl;
                        const isImg = isImageFile(item.mime_type, item.file_name);
                        const badge = getFileBadge(item.mime_type, item.file_name);
                        const canDelete = isTeacher || item.uploader_id === profile?.id;

                        return (
                          <div
                            key={item.id}
                            className="group rounded-xl border border-slate-200 p-2.5 bg-slate-50 hover:bg-white hover:border-blue-300 hover:shadow-sm transition"
                          >
                            <div className="flex items-start gap-2.5">
                              {/* Thumbnail / File Icon */}
                              {isImg && fileUrl ? (
                                <img
                                  src={fileUrl}
                                  alt={item.file_name}
                                  onClick={() => setPreviewModal({ url: fileUrl, name: item.file_name, isImage: true })}
                                  className="h-10 w-10 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-90 transition shrink-0"
                                />
                              ) : (
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${badge.bg}`}>
                                  {badge.icon}
                                </div>
                              )}

                              {/* File Details */}
                              <div className="min-w-0 flex-1">
                                <p
                                  onClick={() => {
                                    if (isImg) {
                                      setPreviewModal({ url: fileUrl, name: item.file_name, isImage: true });
                                    } else if (fileUrl) {
                                      window.open(fileUrl, "_blank");
                                    }
                                  }}
                                  className="text-xs font-semibold text-slate-800 truncate cursor-pointer hover:text-blue-600 hover:underline"
                                  title={item.file_name}
                                >
                                  {item.file_name}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                                  <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${badge.bg}`}>
                                    {badge.label}
                                  </span>
                                  <span>·</span>
                                  <span>{(item.file_size / 1024).toFixed(1)} KB</span>
                                  <span>·</span>
                                  <span className="truncate max-w-[80px]" title={item.profiles?.full_name || "User"}>
                                    {item.profiles?.full_name || "User"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons Row */}
                            <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1">
                              <div className="flex gap-1.5">
                                {/* Open / View Button */}
                                {fileUrl && (
                                  <button
                                    onClick={() => {
                                      if (isImg) {
                                        setPreviewModal({ url: fileUrl, name: item.file_name, isImage: true });
                                      } else {
                                        window.open(fileUrl, "_blank");
                                      }
                                    }}
                                    className="rounded bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-100 transition flex items-center gap-1"
                                    title="Open file in browser"
                                  >
                                    <span>👁️</span> Open
                                  </button>
                                )}

                                {/* Download Button */}
                                {fileUrl && (
                                  <a
                                    href={fileUrl}
                                    download={item.file_name}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition flex items-center gap-1"
                                    title="Download file"
                                  >
                                    <span>⬇️</span> Download
                                  </a>
                                )}
                              </div>

                              {/* Delete Button */}
                              {canDelete && (
                                <button
                                  onClick={() => handleDeleteResource(item.id)}
                                  className="text-[11px] text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                                  title="Delete resource"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Upload Resource Button */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      disabled={uploading}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-blue-400 bg-blue-50/60 p-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer transition disabled:opacity-60"
                    >
                      <span>{uploading ? "⏳ Uploading to Storage..." : "📎 Upload Resource (Supabase Storage)"}</span>
                    </button>
                  </div>
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>

      {/* Fullscreen Image / Document Modal Viewer */}
      {previewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setPreviewModal(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50">
              <div className="min-w-0 flex-1 pr-4">
                <h3 className="font-bold text-sm text-slate-800 truncate">{previewModal.name}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition"
                >
                  Open in New Tab ↗
                </a>
                <a
                  href={previewModal.url}
                  download={previewModal.name}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                >
                  Download ⬇
                </a>
                <button
                  onClick={() => setPreviewModal(null)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 transition font-bold text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[75vh] bg-slate-900/5">
              {previewModal.isImage ? (
                <img
                  src={previewModal.url}
                  alt={previewModal.name}
                  className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-md"
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm font-semibold text-slate-700">Preview not supported directly in modal.</p>
                  <a
                    href={previewModal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 transition"
                  >
                    Open Document in New Tab ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student Removed / Kicked Modal */}
      {kickedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-3xl">
              🚫
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Classroom Session Notice</h3>
              <p className="mt-2 text-sm text-slate-600">
                {kickedModal.reason || "The teacher has removed you from this classroom session."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setKickedModal(null);
                onLeaveRoom();
              }}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

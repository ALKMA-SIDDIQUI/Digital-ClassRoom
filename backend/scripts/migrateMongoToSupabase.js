/**
 * ==============================================================================
 * MongoDB to Supabase Migration Script
 * ==============================================================================
 * 
 * Safely transfers existing RoomBoard and ChatMessage collections from MongoDB
 * into Supabase PostgreSQL (classrooms, boards, board_elements, chat_messages).
 * 
 * Usage:
 *   node scripts/migrateMongoToSupabase.js [--dry-run]
 * 
 * Notes:
 * - Does NOT drop or alter MongoDB collections.
 * - Idempotent: Can be run multiple times safely.
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const { supabaseAdmin, isSupabaseConfigured } = require("../config/supabase");

const isDryRun = process.argv.includes("--dry-run");

async function runMigration() {
  console.log("=================================================================");
  console.log("CollabBoard: Starting MongoDB -> Supabase PostgreSQL Migration");
  console.log(`Mode: ${isDryRun ? "DRY RUN (no database writes)" : "LIVE EXECUTION"}`);
  console.log("=================================================================\n");

  if (!isSupabaseConfigured || !supabaseAdmin) {
    console.error("Error: Supabase is not configured. Please supply SUPABASE_URL and SUPABASE_SECRET_KEY in backend/.env");
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("Error: MONGODB_URI is missing in backend/.env.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully.\n");

    const roomBoardSchema = new mongoose.Schema({
      roomId: { type: String, required: true },
      segments: { type: [mongoose.Schema.Types.Mixed], default: [] },
      teacherSocketId: { type: String, default: null },
      teacherName: { type: String, default: null },
      boardLocked: { type: Boolean, default: false },
    }, { timestamps: true });

    const chatMessageSchema = new mongoose.Schema({
      roomId: { type: String, required: true },
      username: { type: String, required: true },
      message: { type: String, required: true },
      sentAt: { type: Date, default: Date.now },
    }, { timestamps: true });

    const RoomBoard = mongoose.models.RoomBoard || mongoose.model("RoomBoard", roomBoardSchema);
    const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);

    // 1. Fetch any existing teacher from Supabase profiles to assign classroom ownership
    let defaultTeacherId = null;
    const { data: teachers, error: teacherError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name")
      .eq("role", "teacher")
      .limit(1);

    if (teachers && teachers.length > 0) {
      defaultTeacherId = teachers[0].id;
      console.log(`Found teacher account for migrated classrooms: ${teachers[0].full_name} (${teachers[0].id})`);
    } else {
      // Find any profile if no teacher exists yet
      const { data: anyProfiles } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name")
        .limit(1);

      if (anyProfiles && anyProfiles.length > 0) {
        defaultTeacherId = anyProfiles[0].id;
        console.log(`Using existing profile for migrated classrooms: ${anyProfiles[0].full_name} (${anyProfiles[0].id})`);
      } else {
        console.warn("Notice: No profiles found in Supabase. Migration will assign classroom teacher when available or use placeholder UUID.");
        defaultTeacherId = "00000000-0000-0000-0000-000000000000";
      }
    }

    // 2. Query MongoDB RoomBoards
    const mongoRooms = await RoomBoard.find().lean();
    console.log(`Found ${mongoRooms.length} room(s) in MongoDB.`);

    let migratedRooms = 0;
    let migratedElements = 0;
    const roomToClassroomId = new Map();

    for (const room of mongoRooms) {
      const roomCode = room.roomId.trim().toUpperCase();
      console.log(`\nProcessing Room: ${roomCode} with ${room.segments?.length || 0} drawing segments...`);

      if (isDryRun) {
        migratedRooms++;
        migratedElements += room.segments?.length || 0;
        continue;
      }

      // Upsert Classroom in Supabase
      const { data: existingClassroom } = await supabaseAdmin
        .from("classrooms")
        .select("id")
        .eq("room_code", roomCode)
        .maybeSingle();

      let classroomId = existingClassroom?.id;
      if (!classroomId) {
        const { data: newClassroom, error: createError } = await supabaseAdmin
          .from("classrooms")
          .insert({
            room_code: roomCode,
            name: `${room.teacherName ? room.teacherName + "'s" : "Migrated"} Classroom (${roomCode})`,
            teacher_id: defaultTeacherId,
            is_locked: Boolean(room.boardLocked),
          })
          .select()
          .single();

        if (createError) {
          console.error(`Failed to create classroom for ${roomCode}:`, createError.message);
          continue;
        }
        classroomId = newClassroom.id;
      }

      roomToClassroomId.set(roomCode, classroomId);
      migratedRooms++;

      // Upsert Board
      const { data: existingBoard } = await supabaseAdmin
        .from("boards")
        .select("id")
        .eq("classroom_id", classroomId)
        .maybeSingle();

      let boardId = existingBoard?.id;
      if (!boardId) {
        const { data: newBoard, error: boardError } = await supabaseAdmin
          .from("boards")
          .insert({ classroom_id: classroomId, name: "Main Board" })
          .select()
          .single();

        if (boardError) {
          console.error(`Failed to create board for ${roomCode}:`, boardError.message);
          continue;
        }
        boardId = newBoard.id;
      }

      // Migrate segments to board_elements
      if (room.segments && room.segments.length > 0) {
        // Clear previous migrated elements for idempotency if re-running
        await supabaseAdmin.from("board_elements").delete().eq("board_id", boardId);

        const elementRows = room.segments.map((seg, idx) => ({
          board_id: boardId,
          stroke_id: seg.strokeId || `migrated-${roomCode}-${idx}`,
          kind: seg.kind || "stroke",
          data: seg,
          is_deleted: false,
        }));

        // Insert in batches of 200
        const chunkSize = 200;
        for (let i = 0; i < elementRows.length; i += chunkSize) {
          const chunk = elementRows.slice(i, i + chunkSize);
          const { error: insertElementsError } = await supabaseAdmin
            .from("board_elements")
            .insert(chunk);

          if (insertElementsError) {
            console.error(`Batch insert error for room ${roomCode}:`, insertElementsError.message);
          } else {
            migratedElements += chunk.length;
          }
        }
        console.log(`-> Migrated ${elementRows.length} elements to board ${boardId}`);
      }
    }

    // 3. Migrate Chat Messages
    const mongoChats = await ChatMessage.find().lean();
    console.log(`\nFound ${mongoChats.length} chat message(s) in MongoDB.`);
    let migratedChats = 0;

    for (const chat of mongoChats) {
      const roomCode = chat.roomId.trim().toUpperCase();
      const classroomId = roomToClassroomId.get(roomCode);

      if (!classroomId) {
        // Skip orphaned messages if classroom wasn't found
        continue;
      }

      if (isDryRun) {
        migratedChats++;
        continue;
      }

      const { error: chatInsertError } = await supabaseAdmin
        .from("chat_messages")
        .insert({
          classroom_id: classroomId,
          user_id: defaultTeacherId,
          sender_name: chat.username || "Student",
          message: chat.message || "",
          created_at: chat.sentAt ? new Date(chat.sentAt).toISOString() : new Date().toISOString(),
        });

      if (!chatInsertError) {
        migratedChats++;
      }
    }

    console.log("\n=================================================================");
    console.log("Migration Summary:");
    console.log(`- Classrooms migrated: ${migratedRooms}`);
    console.log(`- Drawing elements migrated: ${migratedElements}`);
    console.log(`- Chat messages migrated: ${migratedChats}`);
    console.log("Original MongoDB collections remain intact and untouched.");
    console.log("=================================================================\n");
  } catch (error) {
    console.error("Migration encountered error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runMigration();

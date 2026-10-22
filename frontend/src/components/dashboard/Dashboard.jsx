import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/useAuth";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export default function Dashboard({ onEnterRoom, onNavigate }) {
  const { profile, user, signOut, accessToken, refreshProfile } = useAuth();

  const isTeacher = profile?.role === "teacher";
  const isOfficialTeacher = Boolean(profile?.is_official_teacher && isTeacher);
  const [createdRooms, setCreatedRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Teacher Classroom Creation state
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomCode, setNewRoomCode] = useState("");
  const [creating, setCreating] = useState(false);

  // Student Join state
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joining, setJoining] = useState(false);

  // Teacher Promotion state
  const [promoCode, setPromoCode] = useState("");
  const [promoting, setPromoting] = useState(false);

  // Official Teacher: Manage Promoted Students & Passkey
  const [promotedStudents, setPromotedStudents] = useState([]);
  const [loadingPromoted, setLoadingPromoted] = useState(false);
  const [selectedStudentToRevoke, setSelectedStudentToRevoke] = useState(null);
  const [revoking, setRevoking] = useState(false);
  const [teacherPasskey, setTeacherPasskey] = useState(profile?.teacherPasskey || "");
  const [showPasskey, setShowPasskey] = useState(false);

  // Notifications
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const notify = (msg, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setStatusMsg("");
    } else {
      setStatusMsg(msg);
      setErrorMsg("");
    }
    setTimeout(() => {
      setStatusMsg("");
      setErrorMsg("");
    }, 4000);
  };

  const fetchClassrooms = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${SERVER_URL}/api/classrooms`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedRooms(data.created || []);
        setJoinedRooms(data.joined || []);
      }
    } catch (err) {
      console.error("Fetch classrooms error:", err);
    } finally {
      setLoadingRooms(false);
    }
  }, [accessToken]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!accessToken) return;
      try {
        const res = await fetch(`${SERVER_URL}/api/classrooms`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (active && res.ok && data.success) {
          setCreatedRooms(data.created || []);
          setJoinedRooms(data.joined || []);
        }
      } catch (err) {
        console.error("Init classrooms error:", err);
      } finally {
        if (active) setLoadingRooms(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [accessToken]);

  // Handle Create Classroom
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!accessToken) return;
    try {
      setCreating(true);
      const res = await fetch(`${SERVER_URL}/api/classrooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: newRoomName || "My Collaborative Classroom",
          roomCode: newRoomCode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not create classroom");
      }

      notify(`Classroom ${data.classroom.room_code} created successfully!`);
      setNewRoomName("");
      setNewRoomCode("");
      await fetchClassrooms();

      // Launch into room immediately
      onEnterRoom(data.classroom.room_code, "teacher", data.classroom.name);
    } catch (err) {
      notify(err.message, true);
    } finally {
      setCreating(false);
    }
  };

  // Handle Join Classroom
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim() || !accessToken) {
      notify("Please enter a room code.", true);
      return;
    }

    try {
      setJoining(true);
      const res = await fetch(`${SERVER_URL}/api/classrooms/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ roomCode: joinCodeInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to join classroom");
      }

      notify(`Joined ${data.classroom.roomCode} as ${data.classroom.role}`);
      setJoinCodeInput("");
      await fetchClassrooms();

      onEnterRoom(data.classroom.roomCode, data.classroom.role, data.classroom.name);
    } catch (err) {
      notify(err.message, true);
    } finally {
      setJoining(false);
    }
  };

  // Handle Teacher Promotion with Server Passkey
  const handlePromoteToTeacher = async (e) => {
    e.preventDefault();
    const cleanCode = promoCode.trim();
    if (!cleanCode) {
      notify("Please enter your teacher invitation passkey (TEACH_2026_COLAB_SECRET).", true);
      return;
    }
    if (!accessToken) {
      notify("Your session has expired. Please sign in again.", true);
      return;
    }

    try {
      setPromoting(true);
      const res = await fetch(`${SERVER_URL}/api/auth/register-teacher`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ invitationCode: cleanCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Teacher passkey verification failed.");
      }

      notify("🎉 Verified successfully as Teacher! Classroom creation unlocked.");
      setPromoCode("");
      await refreshProfile(data.profile);
      await fetchClassrooms();
    } catch (err) {
      notify(err.message, true);
    } finally {
      setPromoting(false);
    }
  };

  // Official Teacher: Fetch all students who currently have teacher control
  const fetchPromotedStudents = useCallback(async () => {
    if (!accessToken || !isOfficialTeacher) return;
    try {
      setLoadingPromoted(true);
      const res = await fetch(`${SERVER_URL}/api/auth/promoted-students`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPromotedStudents(data.promotedStudents || []);
        if (data.teacherPasskey) {
          setTeacherPasskey(data.teacherPasskey);
        }
      }
    } catch (err) {
      console.warn("fetchPromotedStudents error:", err);
    } finally {
      setLoadingPromoted(false);
    }
  }, [accessToken, isOfficialTeacher]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!accessToken || !isOfficialTeacher) return;
      try {
        const res = await fetch(`${SERVER_URL}/api/auth/promoted-students`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (active && res.ok && data.success) {
          setPromotedStudents(data.promotedStudents || []);
          if (data.teacherPasskey) {
            setTeacherPasskey(data.teacherPasskey);
          }
        }
      } catch (err) {
        console.warn("Init promoted students error:", err);
      } finally {
        if (active) setLoadingPromoted(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [accessToken, isOfficialTeacher]);

  // Official Teacher: Revoke Teacher Control from an individual student
  const handleRevokeStudentControl = async () => {
    if (!selectedStudentToRevoke?.id || !accessToken) return;
    try {
      setRevoking(true);
      const res = await fetch(`${SERVER_URL}/api/auth/revoke-student-teacher-control`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ targetUserId: selectedStudentToRevoke.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to revoke teacher control.");
      }

      notify(`Teacher control revoked from ${selectedStudentToRevoke.full_name || selectedStudentToRevoke.email}.`);
      setSelectedStudentToRevoke(null);
      await fetchPromotedStudents();
    } catch (err) {
      notify(err.message, true);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <div
            onClick={() => onNavigate?.("/")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#315BFF] to-[#7047FF] font-bold text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="14" x="3" y="3" rx="2" />
                <path d="M3 10h18" />
                <path d="m14 14 3 3" />
                <path d="m17 14-3 3" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                Digital Classroom Board
              </h1>
              <p className="text-xs text-slate-500">Dashboard & Active Sessions</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{profile?.full_name || "User"}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                isTeacher
                  ? "bg-violet-100 text-violet-700 border border-violet-200"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}
            >
              {isTeacher ? "🧑‍🏫 Teacher" : "🎓 Student"}
            </span>

            <button
              onClick={() => onNavigate?.("/")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs hidden sm:inline-block cursor-pointer"
            >
              Public Home
            </button>

            <button
              onClick={signOut}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition shadow-xs cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        {/* Banner Messages */}
        {statusMsg && (
          <div className="rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800 border border-emerald-200 shadow-sm">
            {statusMsg}
          </div>
        )}
        {errorMsg && (
          <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800 border border-red-200 shadow-sm">
            {errorMsg}
          </div>
        )}

        {/* Action Row: Create / Join Forms */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Join Classroom Card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Join a Classroom</h2>
              <span className="text-xs font-medium text-slate-400">Student & Teacher</span>
            </div>
            <form onSubmit={handleJoinRoom} className="space-y-3">
              <p className="text-sm text-slate-600">
                Enter the classroom room code provided by your teacher to enter the live whiteboard session.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. CLASS-ABC123"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 p-3 text-sm uppercase font-mono tracking-wider focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={joining}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {joining ? "Joining..." : "Join"}
                </button>
              </div>
            </form>
          </section>

          {/* Teacher Creation Card OR Teacher Upgrade */}
          {isTeacher ? (
            <section className="rounded-2xl border border-violet-100 bg-violet-50/40 p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-violet-950">Create New Classroom</h2>
              </div>
              <form onSubmit={handleCreateRoom} className="space-y-3">
                <input
                  type="text"
                  placeholder="Classroom Subject / Title (e.g. Math 101)"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  maxLength={60}
                  className="w-full rounded-xl border border-violet-200 bg-white p-3 text-sm focus:border-violet-600 focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Custom Code (optional)"
                    value={newRoomCode}
                    onChange={(e) => setNewRoomCode(e.target.value)}
                    maxLength={15}
                    className="w-1/2 rounded-xl border border-violet-200 bg-white p-3 text-sm uppercase font-mono focus:border-violet-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-1/2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-violet-700 transition disabled:opacity-60"
                  >
                    {creating ? "Creating..." : "Create & Open"}
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="mb-2">
                  <h2 className="text-lg font-bold text-slate-900">Teacher Access</h2>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Are you an educator? Verify your secret teacher invitation passkey to unlock classroom creation, whiteboard locking, and undo/redo controls.
                </p>

                <form onSubmit={handlePromoteToTeacher} className="space-y-2.5">
                  <label className="block text-xs font-semibold text-slate-700">Teacher Invitation Passkey</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Enter secret passkey"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="min-w-0 flex-1 rounded-xl border border-slate-300 p-2.5 text-sm font-mono tracking-wide focus:border-violet-600 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={promoting}
                      className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition disabled:opacity-60 shadow-sm shrink-0"
                    >
                      {promoting ? "Verifying..." : "Verify & Unlock"}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    🔒 Authorized educators only. Passkey is provided by your school administrator.
                  </p>
                </form>
              </div>
            </section>
          )}
        </div>

        {/* Official Teacher: Promoted Students Access Management Section */}
        {isOfficialTeacher && (
          <section className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-purple-100">
              <div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Teacher Access & Permission Control</h2>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  View all students who currently hold Teacher Control. As the official teacher, you have exclusive authority to individually revoke control from any student.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchPromotedStudents}
                disabled={loadingPromoted}
                className="text-xs font-semibold text-purple-700 hover:text-purple-900 underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                {loadingPromoted ? "Refreshing..." : "↻ Refresh List"}
              </button>
            </div>

            {/* Official Teacher Secret Passkey Display */}
            {teacherPasskey && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-purple-200 bg-purple-50/50 p-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                      Your Teacher Invitation Passkey
                    </span>
                    <span className="rounded bg-purple-200/80 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                      Private Code
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Share this secret passkey only with students or assistants whom you want to grant teacher access.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="flex items-center rounded-lg border border-purple-200 bg-white px-3 py-1.5 font-mono text-sm font-bold text-purple-900 shadow-xs tracking-wider">
                    {showPasskey ? teacherPasskey : "••••••••••••••••••••••"}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="rounded-lg border border-purple-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition shadow-xs cursor-pointer"
                    title={showPasskey ? "Hide passkey" : "Show passkey"}
                  >
                    {showPasskey ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(teacherPasskey);
                      notify("Teacher passkey copied to clipboard!");
                    }}
                    className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition shadow-xs cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {loadingPromoted ? (
              <div className="py-8 text-center text-sm text-slate-500">Loading student permissions...</div>
            ) : promotedStudents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                <p className="font-semibold text-slate-700">No students currently hold teacher control</p>
                <p className="text-xs text-slate-500 mt-1">
                  When a student enters the teacher invitation passkey, they will appear here and you can revoke their access anytime.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {promotedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex flex-col justify-between rounded-xl border border-purple-100 bg-purple-50/30 p-4 transition hover:shadow-sm hover:border-purple-200"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 font-bold text-white text-xs shadow-xs">
                            {student.full_name?.charAt(0)?.toUpperCase() || "S"}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {student.full_name}
                            </h3>
                            <p className="text-xs text-slate-500 truncate">{student.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 bg-white/80 p-2 rounded-lg border border-purple-100/60">
                        <span className="font-semibold text-purple-700">Role: Promoted Teacher</span>
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Active</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-purple-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentToRevoke(student)}
                        className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title={`Revoke teacher control from ${student.full_name}`}
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        Revoke Control
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Created Classrooms Section (Teachers) */}
        {isTeacher && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Your Classrooms ({createdRooms.length})</h2>
              <button
                onClick={fetchClassrooms}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Refresh
              </button>
            </div>

            {loadingRooms ? (
              <p className="text-sm text-slate-400 py-4">Loading your classrooms...</p>
            ) : createdRooms.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">
                You haven't created any classrooms yet. Use the form above to start your first session!
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {createdRooms.map((room) => (
                  <div
                    key={room.id}
                    className="rounded-xl border border-slate-200 p-4 hover:border-violet-300 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">
                          {room.room_code}
                        </span>
                        {room.is_locked && (
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                            Locked
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 line-clamp-1">{room.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Created {new Date(room.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(room.room_code);
                          notify(`Copied ${room.room_code} to clipboard!`);
                        }}
                        className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                      >
                        Copy Code
                      </button>
                      <button
                        onClick={() => onEnterRoom(room.room_code, "teacher", room.name)}
                        className="flex-1 rounded-lg bg-violet-600 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition"
                      >
                        Open Board
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Joined / Enrolled Classrooms Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {isTeacher ? "Other Classrooms You Joined" : "Your Classrooms"} ({joinedRooms.length})
            </h2>
            <button
              onClick={fetchClassrooms}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Refresh
            </button>
          </div>

          {loadingRooms ? (
            <p className="text-sm text-slate-400 py-4">Loading enrolled classrooms...</p>
          ) : joinedRooms.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">
              You haven't joined any classrooms yet. Enter a room code above to participate!
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {joinedRooms.map((room) => (
                <div
                  key={room.id}
                  className="rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {room.room_code}
                      </span>
                      {room.is_locked && (
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                          Locked
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 line-clamp-1">{room.name}</h3>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(room.room_code);
                        notify(`Copied ${room.room_code} to clipboard!`);
                      }}
                      className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Copy Code
                    </button>
                    <button
                      onClick={() => onEnterRoom(room.room_code, "student", room.name)}
                      className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                    >
                      Enter Board
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Revoke Individual Student Teacher Control Confirmation Modal */}
      {selectedStudentToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4 mx-auto">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="17" x2="22" y1="8" y2="13" />
                <line x1="22" x2="17" y1="8" y2="13" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
              Revoke Teacher Control?
            </h3>
            <p className="text-sm text-slate-600 text-center mb-6 leading-relaxed">
              Are you sure you want to revoke Teacher Control from{" "}
              <span className="font-bold text-slate-900">{selectedStudentToRevoke.full_name}</span> (
              <span className="font-mono text-purple-700">{selectedStudentToRevoke.email}</span>)?
              <br /><br />
              This will immediately revert their account to a <span className="font-semibold text-blue-700">Student</span> role and lock classroom creation for them.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={revoking}
                onClick={() => setSelectedStudentToRevoke(null)}
                className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={revoking}
                onClick={handleRevokeStudentControl}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {revoking ? "Revoking..." : "Yes, Revoke Control"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

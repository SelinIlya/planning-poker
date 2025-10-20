import { nanoid } from "nanoid";

// In-memory store: roomId -> room
// Room shape: {
//   id: string,
//   hostId: string,
//   task: string,
//   revealed: boolean,
//   participants: Map<socketId, { id, name, category: string, vote: string | number | null }>
// }

export function createRoomStore() {
  /** @type {Map<string, any>} */
  const rooms = new Map();
  /** @type {Map<string, Set<string>>} socketId -> set of roomIds */
  const socketToRooms = new Map();

  function createRoom(hostSocketId, hostName, category) {
    const roomId = nanoid(8);
    const participants = new Map();
    participants.set(hostSocketId, { id: hostSocketId, name: hostName, category: category ?? "Visitor", vote: null });
    rooms.set(roomId, {
      id: roomId,
      hostId: hostSocketId,
      task: "",
      revealed: false,
      participants,
    });
    track(socketToRooms, hostSocketId, roomId);
    return { roomId, state: getPublicState(roomId) };
  }

  function joinRoom(roomId, socketId, name, category) {
    const room = rooms.get(roomId);
    if (!room) return { ok: false, error: "ROOM_NOT_FOUND" };
    room.participants.set(socketId, { id: socketId, name, category: category ?? "Visitor", vote: null });
    track(socketToRooms, socketId, roomId);
    return { ok: true };
  }

  function leaveAll(socketId) {
    const roomIds = socketToRooms.get(socketId);
    if (!roomIds) return [];
    const affected = Array.from(roomIds);
    for (const roomId of roomIds) {
      const room = rooms.get(roomId);
      if (!room) continue;
      room.participants.delete(socketId);
      // Host permanence: do not auto-transfer host on leave
      // Delete room if empty
      if (room.participants.size === 0) {
        rooms.delete(roomId);
      }
    }
    socketToRooms.delete(socketId);
    return affected;
  }

  function setTask(roomId, task) {
    const room = rooms.get(roomId);
    if (!room) return;
    // Only update task name; do NOT reset votes or revealed state
    room.task = String(task ?? "");
  }

  function setVote(roomId, socketId, value) {
    const room = rooms.get(roomId);
    if (!room) return;
    const participant = room.participants.get(socketId);
    if (!participant) return;
    participant.vote = value;
  }

  function reveal(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    room.revealed = true;
  }

  function newRound(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    room.revealed = false;
    room.task = room.task; // keep task
    for (const p of room.participants.values()) {
      p.vote = null;
    }
  }

  function updateParticipant(roomId, targetSocketId, updates) {
    const room = rooms.get(roomId);
    if (!room) return false;
    const p = room.participants.get(targetSocketId);
    if (!p) return false;
    if (typeof updates.name === "string" && updates.name.trim()) p.name = updates.name.trim();
    if (typeof updates.category === "string" && updates.category.trim()) p.category = updates.category.trim();
    return true;
  }

  function setHost(roomId, targetSocketId) {
    const room = rooms.get(roomId);
    if (!room) return false;
    if (!room.participants.has(targetSocketId)) return false;
    room.hostId = targetSocketId;
    return true;
  }

  function isHost(roomId, socketId) {
    const room = rooms.get(roomId);
    if (!room) return false;
    return room.hostId === socketId;
  }

  function exists(roomId) {
    return rooms.has(roomId);
  }

  function getPublicState(roomId) {
    const room = rooms.get(roomId);
    if (!room) return null;
    const participants = Array.from(room.participants.values()).map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      vote: room.revealed ? p.vote : (p.vote ? "•" : null),
    }));
    // Calculate average on revealed numeric votes
    let average = null;
    let byCategory = {};
    if (room.revealed) {
      const raw = Array.from(room.participants.values());
      const numeric = raw.map((p) => (typeof p.vote === "number" ? p.vote : null)).filter((v) => v !== null);
      if (numeric.length > 0) {
        average = Number(
          (numeric.reduce((a, b) => a + b, 0) / numeric.length).toFixed(2)
        );
      }
      // per-category averages
      const catMap = new Map();
      for (const p of raw) {
        if (typeof p.vote === "number") {
          const key = p.category || "Visitor";
          const arr = catMap.get(key) ?? [];
          arr.push(p.vote);
          catMap.set(key, arr);
        }
      }
      byCategory = Object.fromEntries(
        Array.from(catMap.entries()).map(([k, arr]) => [k, Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2))])
      );
    }
    return {
      roomId: room.id,
      hostId: room.hostId,
      task: room.task,
      revealed: room.revealed,
      participants,
      average,
      byCategory,
    };
  }

  return {
    createRoom,
    joinRoom,
    leaveAll,
    setTask,
    setVote,
    reveal,
    newRound,
    updateParticipant,
    setHost,
    isHost,
    exists,
    getPublicState,
  };
}

function track(map, key, roomId) {
  const set = map.get(key) ?? new Set();
  set.add(roomId);
  map.set(key, set);
}



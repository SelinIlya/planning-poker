import express from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import { createRoomStore } from "./rooms.js";

const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: CLIENT_ORIGIN },
});

const rooms = createRoomStore();

io.on("connection", (socket) => {
  // Client requests to create a new room
  socket.on("create_room", ({ name, category }, callback) => {
    const { roomId, state } = rooms.createRoom(socket.id, name ?? "Host", category ?? "Visitor");
    socket.join(roomId);
    if (callback) callback({ roomId, state });
  });

  // Join an existing room
  socket.on("join_room", ({ roomId, name, category }, callback) => {
    const result = rooms.joinRoom(roomId, socket.id, name ?? "Guest", category ?? "Visitor");
    if (!result.ok) {
      if (callback) callback({ ok: false, error: result.error });
      return;
    }
    socket.join(roomId);
    io.to(roomId).emit("state", rooms.getPublicState(roomId));
    if (callback) callback({ ok: true, state: rooms.getPublicState(roomId) });
  });

  socket.on("set_task", ({ roomId, task }) => {
    if (!rooms.isHost(roomId, socket.id)) return;
    rooms.setTask(roomId, task);
    io.to(roomId).emit("state", rooms.getPublicState(roomId));
  });

  socket.on("vote", ({ roomId, value }) => {
    rooms.setVote(roomId, socket.id, value);
    io.to(roomId).emit("state", rooms.getPublicState(roomId));
  });

  socket.on("reveal", ({ roomId }) => {
    if (!rooms.isHost(roomId, socket.id)) return;
    rooms.reveal(roomId);
    io.to(roomId).emit("state", rooms.getPublicState(roomId));
  });

  socket.on("new_round", ({ roomId }) => {
    if (!rooms.isHost(roomId, socket.id)) return;
    rooms.newRound(roomId);
    io.to(roomId).emit("state", rooms.getPublicState(roomId));
  });

  socket.on("reset_results", ({ roomId }) => {
    if (!rooms.isHost(roomId, socket.id)) return;
    rooms.newRound(roomId);
    io.to(roomId).emit("state", rooms.getPublicState(roomId));
  });

  socket.on("update_participant", ({ roomId, targetId, name, category }) => {
    const isHost = rooms.isHost(roomId, socket.id);
    if (!isHost && socket.id !== targetId) return; // only self-edit unless host
    const ok = rooms.updateParticipant(roomId, targetId, { name, category });
    if (ok) io.to(roomId).emit("state", rooms.getPublicState(roomId));
  });

  socket.on("set_host", ({ roomId, targetId }) => {
    if (!rooms.isHost(roomId, socket.id)) return;
    const ok = rooms.setHost(roomId, targetId);
    if (ok) io.to(roomId).emit("state", rooms.getPublicState(roomId));
  });

  socket.on("disconnect", () => {
    const affectedRooms = rooms.leaveAll(socket.id);
    for (const roomId of affectedRooms) {
      // If room is empty, it was deleted. Otherwise, broadcast updated state.
      if (rooms.exists(roomId)) {
        io.to(roomId).emit("state", rooms.getPublicState(roomId));
      }
    }
  });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

httpServer.listen(PORT, () => {
  console.log(`Planning Poker server listening on http://localhost:${PORT}`);
});



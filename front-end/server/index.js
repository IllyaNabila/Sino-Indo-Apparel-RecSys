import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("personalChannel", (businessId) => {
    socket.join(String(businessId));
    console.log(`Socket ${socket.id} joined personal channel: ${businessId}`);
  });

  socket.on("joinConversation", (selectedChat) => {
    socket.join(selectedChat);
    console.log(`Socket ${socket.id} joined room: ${selectedChat}`);
  });

  socket.on("sendMessage", (data) => {
    const { selectedChat, msg } = data;
    io.to(selectedChat).emit("receiveMessage", data);
    io.to(String(msg.receiverId)).emit("newNotification", data);
    console.log("newnoti")
  });

  socket.on("endConversation", (payload) => {
    const { conversationId } = payload;
    io.to(conversationId).emit("endConversation", payload);
  });

  socket.on("disconnect", () => {
    console.log("Disconnect:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
// ✅ Render likes binding to 0.0.0.0 explicitly
server.listen(PORT, "0.0.0.0", () => console.log(`Server running on ${PORT}`));

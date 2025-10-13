import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "http://localhost:3000"}));
app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("Connected:", socket.id);
   // const token = socket.handshake.auth.token;
   // const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
   // const userId = decoded.businessId;

    {/**if(userId) {
        socket.join(userId);
    };*/}

    socket.on("personalChannel", (businessId) =>{
        socket.join(businessId);
        console.log(`Socket ${socket.id} joined personal channel: ${businessId}`);
    });

    socket.on("joinConversation", (selectedChat) =>{
        socket.join(selectedChat);
        console.log(`Socket ${socket.id} joined room: ${selectedChat}`);
    });
    
    socket.on("sendMessage", (data) => {
        console.log("Message", data);
        const { selectedChat, msg } = data;
        io.to(selectedChat).emit("receiveMessage", data);
        io.to(msg.receiverId).emit("newNotification", data);
    });

    socket.on("disconnect", () => {
        console.log("Disconnect:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
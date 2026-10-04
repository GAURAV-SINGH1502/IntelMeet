import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import redisClient from "./config/redis.js";
import authRoutes from "./routes/authRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";

const app = express();

// Trust proxy for Render / Vercel / Cloudflare load balancers
app.set("trust proxy", 1);

// Connect to MongoDB
connectDB();

// Connect to Redis in background (non-blocking)
if (redisClient) {
  redisClient.connect()
    .then(() => {
      console.log("✅ Redis Connected Successfully");
    })
    .catch((err) => {
      console.warn("⚠️ Redis Connection Failed (caching disabled, using direct DB):", err.message || err);
    });
}

// Allowed origins for CORS
const allowedOrigins = [
  "https://intel-meet-opal.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.trim());
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.startsWith("http://localhost:")
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Allow origin
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later." },
});

app.use("/api/auth", authLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/meetings", meetingRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mongoReady: mongoose.connection.readyState === 1,
    redisReady: redisClient ? redisClient.isOpen : false,
  });
});

app.get("/", (req, res) => {
  res.send("Backend Working");
});

app.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Private Profile",
    user: req.user,
  });
});

const roomUsers = {};

const server = createServer(app);

// Socket.io with open CORS so any Vercel/localhost deployment can connect
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.emit("welcome", {
    message: "Socket Connected Successfully",
  });

  socket.on("join-meeting", ({ meetingCode, name }) => {
    if (!meetingCode) return;

    socket.join(meetingCode);

    if (!roomUsers[meetingCode]) {
      roomUsers[meetingCode] = [];
    }

    roomUsers[meetingCode] = roomUsers[meetingCode].filter(
      (user) => user.id !== socket.id
    );

    roomUsers[meetingCode].push({
      id: socket.id,
      name: name || "Guest",
    });

    io.to(meetingCode).emit("participants-list", roomUsers[meetingCode]);

    socket.to(meetingCode).emit("user-joined", {
      userId: socket.id,
      name: name || "Guest",
    });
  });

  socket.on("offer", ({ offer, room }) => {
    if (!room) return;
    console.log("Offer Received for room:", room);
    socket.to(room).emit("offer", offer);
  });

  socket.on("answer", ({ answer, room }) => {
    if (!room) return;
    console.log("Answer Received for room:", room);
    socket.to(room).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ candidate, room }) => {
    if (!room) return;
    socket.to(room).emit("ice-candidate", candidate);
  });

  socket.on("send-message", ({ room, message }) => {
    if (!room) return;
    console.log(`Message in ${room}:`, message);
    socket.to(room).emit("receive-message", {
      message,
      sender: socket.id,
    });
  });

  socket.on("notify", ({ room, notification }) => {
    if (!room) return;
    socket.to(room).emit("notification", {
      notification,
      time: new Date(),
    });
  });

  socket.on("raise-hand", ({ room, raised, name }) => {
    if (!room) return;
    socket.to(room).emit("hand-raised", {
      raised,
      name,
    });
  });

  socket.on("leave-meeting", ({ meetingCode }) => {
    if (!meetingCode || !roomUsers[meetingCode]) return;

    console.log("Leave Meeting:", meetingCode, socket.id);

    roomUsers[meetingCode] = roomUsers[meetingCode].filter(
      (user) => user.id !== socket.id
    );

    io.to(meetingCode).emit("participants-list", roomUsers[meetingCode]);

    socket.to(meetingCode).emit("user-left", {
      userId: socket.id,
    });

    socket.leave(meetingCode);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);

    Object.keys(roomUsers).forEach((room) => {
      const wasInRoom = roomUsers[room].some((u) => u.id === socket.id);
      if (wasInRoom) {
        roomUsers[room] = roomUsers[room].filter((user) => user.id !== socket.id);
        io.to(room).emit("participants-list", roomUsers[room]);
        socket.to(room).emit("user-left", {
          userId: socket.id,
        });
      }
    });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import rateLimit from "express-rate-limit";
import meetingRoutes from "./routes/meetingRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import redisClient from "./config/redis.js";
import aiRoutes from "./routes/aiRoutes.js";
dotenv.config();

connectDB();
redisClient.connect()
  .then(() => {
    console.log("Redis Connected");
    
    

    
  })
  .catch((err) => {
    console.log("Redis Connection Error:", err);
  });
  const roomUsers = {};
const app = express();

app.use(cors());
app.use(express.json());
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,

  max: 5,

  message: "Too many requests",
});
app.use("/api/auth", limiter);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.get("/", (req, res) => {
  res.send("Backend Working");
});
app.get(
 "/profile",
 authMiddleware,

 (req,res)=>{
    res.json({
      message:"Private Profile",
      user:req.user
    })
 }
);

app.use("/api/meetings", meetingRoutes);


const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("answer", ({ answer, room }) => {

  console.log("Answer Received");

  socket.to(room).emit(
    "answer",
    answer
  );

});
socket.on(
  "raise-hand",
  ({ room, raised, name }) => {

    socket.to(room).emit(
      "hand-raised",
      {
        raised,
        name,
      }
    );

  }
);
  socket.on("offer", ({ offer, room }) => {

  console.log("Offer Received");

  socket.to(room).emit(
    "offer",
    offer
  );

});
  console.log("User Connected:", socket.id);
  socket.emit("welcome", {
    message: "Socket Connected Successfully"
  });
  
  socket.on(
  "ice-candidate",
  ({ candidate, room }) => {

    socket.to(room).emit(
      "ice-candidate",
      candidate
    );

  }
);socket.on(
  "send-message",
  ({ room, message }) => {

    console.log(
      "Message:",
      message
    );

    socket.to(room).emit(
      "receive-message",
      {
        message,
        sender: socket.id,
      }
    );

  }
);

socket.on(
  "notify",
  ({ room, notification }) => {

    socket.to(room).emit(
      "notification",
      {
        notification,
        time: new Date(),
      }
    );

  }
);
   socket.on(
  "join-meeting",
  ({ meetingCode, name }) => {

    socket.join(meetingCode);

    if (!roomUsers[meetingCode]) {
      roomUsers[meetingCode] = [];
    }
roomUsers[meetingCode] =
  roomUsers[meetingCode].filter(
    (user) =>
      user.id !== socket.id
  );
    roomUsers[meetingCode].push({
      id: socket.id,
      name,
    });

   io.to(meetingCode).emit(
  "participants-list",
  roomUsers[meetingCode]
);

    socket.to(meetingCode).emit(
      "user-joined",
      {
        userId: socket.id,
        name,
      }
    );

  }
);

socket.on(
  "leave-meeting",
  ({ meetingCode }) => {

    console.log(
      "Leave Meeting:",
      meetingCode
    );

    if (
      !meetingCode ||
      !roomUsers[meetingCode]
    ) {

      console.log(
        "Room not found"
      );

      return;

    }

    roomUsers[meetingCode] =
      roomUsers[meetingCode].filter(
        (user) =>
          user.id !== socket.id
      );

    io.to(meetingCode).emit(
      "participants-list",
      roomUsers[meetingCode]
    );

    socket.to(meetingCode).emit(
      "user-left",
      {
        userId: socket.id,
      }
    );

    socket.leave(meetingCode);

  }
);
   

socket.on("disconnect", () => {

  console.log(
    "User Disconnected:",
    socket.id
  );

  Object.keys(roomUsers)
    .forEach((room) => {

      roomUsers[room] =
        roomUsers[room].filter(
          (user) =>
            user.id !== socket.id
        );
        io.to(room).emit(
          "participants-list",
          roomUsers[room]
        );
      socket.to(room).emit(
        "user-left",
        {
          userId: socket.id,
        }
      );

    });

});

});

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import rateLimit from "express-rate-limit";
import meetingRoutes from "./routes/meetingRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";
dotenv.config();

connectDB();

const app = express();

app.use(express.json());
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,

  max: 5,

  message: "Too many requests",
});
app.use("/api/auth", limiter);
app.use("/api/auth", authRoutes);

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
);
   socket.on("join-meeting", (meetingCode) => {

  socket.join(meetingCode);

  console.log(
    `Socket ${socket.id} joined room ${meetingCode}`
  );

  socket.emit(
    "joined-successfully",
    {
      room: meetingCode
    }
  );
socket.to(meetingCode).emit(
    "user-joined",
    {
      userId: socket.id
    }
  );

});
});

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
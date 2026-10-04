import { io } from "socket.io-client";

const socket = io("https://intelmeet-03a1.onrender.com", {
  transports: ["websocket", "polling"],
  withCredentials: false,
});

export default socket;
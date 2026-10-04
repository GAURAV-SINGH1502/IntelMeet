import { io } from "socket.io-client";

const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const defaultSocketUrl = isLocal
  ? "http://localhost:5000"
  : "https://intelmeet-03a1.onrender.com";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  defaultSocketUrl;

const socket = io(SOCKET_URL, {
  transports: ["polling", "websocket"],
  withCredentials: false,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 20000,
});

export default socket;
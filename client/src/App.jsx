// import { useState, useEffect, useRef } from "react";
// import "./App.css";
// import socket from "./socket";
// import useMeetingStore from "./store/useMeetingStore";
// import VideoRoom from "./components/VideoRoom";
// import ChatBox from "./components/ChatBox";
// function App() {
//   // =========================
//   // Refs
//   // =========================
// const { user, setUser } =useMeetingStore();
//   const videoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const streamRef = useRef(null);
//   const peerRef = useRef(null);

//   // =========================
//   // State
//   // =========================

//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);

//   // =========================
//   // Send Chat Message
//   // =========================

//   const sendMessage = () => {
//     if (!message.trim()) return;

//     socket.emit("send-message", {
//       room: "TEST123",
//       message,
//     });

//     socket.emit("notify", {
//       room: "TEST123",
//       notification: "New message from user",
//     });

//     setMessages((prev) => [
//       ...prev,
//       {
//         sender: "Me",
//         message,
//       },
//     ]);

//     setMessage("");
//   };

//   // =========================
//   // Main useEffect
//   // =========================

//   useEffect(() => {
//     // =========================
//     // Media Access
//     // =========================
// setUser({
//   name: "Gaurav",
// });
//     navigator.mediaDevices
//       .getUserMedia({
//         video: true,
//         audio: true,
//       })
//       .then((stream) => {
//         console.log("Media Access Granted");

//         streamRef.current = stream;

//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//         }

//         // =========================
//         // Create Peer Connection
//         // =========================

//         peerRef.current = new RTCPeerConnection({
//           iceServers: [
//             {
//               urls: "stun:stun.l.google.com:19302",
//             },
//           ],
//         });

//         console.log("Peer Connection Created");

//         // =========================
//         // Add Tracks
//         // =========================

//         stream.getTracks().forEach((track) => {
//           peerRef.current.addTrack(track, stream);
//         });

//         console.log("Tracks Added");

//         // =========================
//         // Receive Remote Stream
//         // =========================

//         peerRef.current.ontrack = (event) => {
//           console.log("Remote Track Received");

//           if (remoteVideoRef.current) {
//             remoteVideoRef.current.srcObject =
//               event.streams[0];
//           }
//         };

//         // =========================
//         // ICE Candidate
//         // =========================

//         peerRef.current.onicecandidate = (event) => {
//           if (event.candidate) {
//             console.log(
//               "ICE Candidate Generated"
//             );

//             socket.emit(
//               "ice-candidate",
//               {
//                 candidate: event.candidate,
//                 room: "TEST123",
//               }
//             );
//           }
//         };

//         // =========================
//         // Create Offer
//         // =========================

//         peerRef.current
//           .createOffer()
//           .then((offer) => {
//             return peerRef.current.setLocalDescription(
//               offer
//             );
//           })
//           .then(() => {
//             console.log("Offer Created");

//             socket.emit("offer", {
//               offer:
//                 peerRef.current.localDescription,
//               room: "TEST123",
//             });
//           });

//         console.log(stream);
//       })
//       .catch((err) => {
//         console.log("Media Error:", err);
//       });

//     // =========================
//     // Socket Events
//     // =========================

//     socket.on("connect", () => {
//       console.log(
//         "Connected:",
//         socket.id
//       );

//       socket.emit(
//         "join-meeting",
//         "TEST123"
//       );
//     });

//     socket.on("welcome", (data) => {
//       console.log(data);
//     });

//     socket.on(
//       "joined-successfully",
//       (data) => {
//         console.log(data);
//       }
//     );

//     socket.on("user-joined", (data) => {
//       console.log(
//         "New User:",
//         data
//       );
//     });

//     // =========================
//     // Chat
//     // =========================

//     socket.on(
//       "receive-message",
//       (data) => {
//         setMessages((prev) => [
//           ...prev,
//           data,
//         ]);
//       }
//     );

//     // =========================
//     // Notifications
//     // =========================

//     socket.on(
//       "notification",
//       (data) => {
//         console.log(
//           "Notification:",
//           data
//         );
//       }
//     );

//     // =========================
//     // Offer
//     // =========================

//     socket.on(
//       "offer",
//       async (offer) => {
//         console.log(
//           "Offer Received From Peer"
//         );

//         await peerRef.current.setRemoteDescription(
//           new RTCSessionDescription(
//             offer
//           )
//         );

//         const answer =
//           await peerRef.current.createAnswer();

//         await peerRef.current.setLocalDescription(
//           answer
//         );

//         console.log(
//           "Answer Created"
//         );

//         socket.emit("answer", {
//           answer,
//           room: "TEST123",
//         });
//       }
//     );

//     // =========================
//     // Answer
//     // =========================

//     socket.on(
//       "answer",
//       async (answer) => {
//         console.log(
//           "Answer Received"
//         );

//         await peerRef.current.setRemoteDescription(
//           new RTCSessionDescription(
//             answer
//           )
//         );
//       }
//     );

//     // =========================
//     // ICE Candidate Receive
//     // =========================

//     socket.on(
//       "ice-candidate",
//       async (candidate) => {
//         console.log(
//           "ICE Candidate Received"
//         );

//         await peerRef.current.addIceCandidate(
//           new RTCIceCandidate(
//             candidate
//           )
//         );
//       }
//     );

//     return () => {
//       socket.off();
//     };
//   }, []);

//   // =========================
//   // UI
//   // =========================

//   return (
    
//      <>
//      <VideoRoom
//   localVideoRef={videoRef}
//   remoteVideoRef={remoteVideoRef}
// />

// <ChatBox
//   message={message}
//   setMessage={setMessage}
//   sendMessage={sendMessage}
//   messages={messages}
// />
//      </>
//     //   <h1>IntellMeet</h1>

//     //   <h2>Local Video</h2>

//     //   <video
//     //     ref={videoRef}
//     //     autoPlay
//     //     playsInline
//     //     muted
//     //     width="400"
//     //   />

//     //   <h2>Remote Video</h2>

//     //   <video
//     //     ref={remoteVideoRef}
//     //     autoPlay
//     //     playsInline
//     //     width="400"
//     //   />

//     //   <h2>Chat</h2>

//     //   <input
//     //     type="text"
//     //     value={message}
//     //     onChange={(e) =>
//     //       setMessage(e.target.value)
//     //     }
//     //     placeholder="Type message..."
//     //   />

//     //   <button onClick={sendMessage}>
//     //     Send
//     //   </button>

//     //   <div>
//     //     {messages.map(
//     //       (msg, index) => (
//     //         <p key={index}>
//     //           <strong>
//     //             {msg.sender}:
//     //           </strong>{" "}
//     //           {msg.message}
//     //         </p>
//     //       )
//     //     )}
//     //   </div>
//     // </>
//   );
// }

// export default App;
import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Meeting from "./pages/Meeting";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/meeting/:meetingCode"
        element={
          <ProtectedRoute>
            <Meeting />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
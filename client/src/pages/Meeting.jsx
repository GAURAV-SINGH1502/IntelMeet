// import VideoRoom from "../components/VideoRoom";
// import ChatBox from "../components/ChatBox";

// function Meeting(props) {
//   return (
//     <div className="p-8">
//       <h1 className="text-4xl font-bold mb-6">
//         Meeting Room
//       </h1>

//       <VideoRoom
//         localVideoRef={props.videoRef}
//         remoteVideoRef={props.remoteVideoRef}
//       />

//       <ChatBox
//         message={props.message}
//         setMessage={props.setMessage}
//         sendMessage={props.sendMessage}
//         messages={props.messages}
//       />
//     </div>
//   );
// }

// export default Meeting;




// function Meeting() {
//   return (
//     <div className="p-8">
//       <h1 className="text-4xl font-bold">
//         Meeting Room
//       </h1>

//       <p>
//         Routing is working 🚀
//       </p>
//     </div>
//   );
// }

// export default Meeting;
import { useEffect, useState, useRef } from "react";
import { useParams , useNavigate} from "react-router-dom";

import socket from "../socket";

import VideoRoom from "../components/VideoRoom";
import ChatBox from "../components/ChatBox";
import useMeetingStore from "../store/useMeetingStore";
function Meeting() {
  const { meetingCode } = useParams();
const { user } = useMeetingStore();
  // =========================
  // Refs
  // =========================

  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const peerRef = useRef(null);
  const navigate = useNavigate();
  const screenTrackRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  // =========================
  // State
  // =========================

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  // =========================
  // Send Message
  // =========================

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send-message", {
      room: meetingCode,
      message,
    });
socket.emit("notify", {
    room: meetingCode,
    notification: "New message received",
  });
    setMessages((prev) => [
      ...prev,
      {
        sender: "Me",
        message,
      },
    ]);

    setMessage("");
  };

// Toggle Function Mute
  const toggleMute = () => {

  const audioTrack =
    streamRef.current
      ?.getAudioTracks()[0];

  if (!audioTrack) return;

  audioTrack.enabled =
    !audioTrack.enabled;

  setIsMuted(
    !audioTrack.enabled
  );
console.log(
  audioTrack.enabled
);
};
//Toggle Function Camera
const toggleCamera = () => {

  const videoTrack =
    streamRef.current
      ?.getVideoTracks()[0];

  if (!videoTrack) return;

  videoTrack.enabled =
    !videoTrack.enabled;

  setCameraOff(
    !videoTrack.enabled
  );
  console.log(
  videoTrack.enabled
);

};

// 
const leaveMeeting = () => {
console.log(
  "Leaving Room:",
  meetingCode
);
  socket.emit(
    "leave-meeting",
    {
      meetingCode,
    }
  );

  streamRef.current
    ?.getTracks()
    .forEach((track) =>
      track.stop()
    );

  if (peerRef.current) {

    peerRef.current.ontrack = null;
    peerRef.current.onicecandidate = null;

    peerRef.current.close();

    peerRef.current = null;

  }

  navigate("/");

};
//
const shareScreen = async () => {

  try {

    const screenStream =
      await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

    console.log(
      "Screen Sharing Started"
    );

    const screenTrack =
      screenStream.getVideoTracks()[0];
screenTrackRef.current =
  screenTrack;
    // Local Preview
    if (videoRef.current) {
      videoRef.current.srcObject =
        screenStream;
    }

    // Replace WebRTC Video Track
    const sender =
      peerRef.current
        ?.getSenders()
        .find(
          (s) =>
            s.track?.kind ===
            "video"
        );

    if (sender) {

      await sender.replaceTrack(
        screenTrack
      );

      console.log(
        "Video Track Replaced"
      );

    }

    setIsSharing(true);
    screenTrack.onended =
  async () => {

    console.log(
      "Screen Sharing Stopped"
    );

    const cameraTrack =
      streamRef.current
        ?.getVideoTracks()[0];

    const sender =
      peerRef.current
        ?.getSenders()
        .find(
          (s) =>
            s.track?.kind ===
            "video"
        );

    if (
      sender &&
      cameraTrack
    ) {

      await sender.replaceTrack(
        cameraTrack
      );

    }

    if (videoRef.current) {

      videoRef.current.srcObject =
        streamRef.current;

    }

    setIsSharing(false);

  };


  } catch (error) {

    console.log(
      "Screen Share Error:",
      error
    );

  }

};



const stopSharing = async () => {

  if (!screenTrackRef.current) return;

  const cameraTrack =
    streamRef.current
      ?.getVideoTracks()[0];

  const sender =
    peerRef.current
      ?.getSenders()
      .find(
        (s) =>
          s.track?.kind ===
          "video"
      );

  if (
    sender &&
    cameraTrack
  ) {

    await sender.replaceTrack(
      cameraTrack
    );

  }

  if (videoRef.current) {

    videoRef.current.srcObject =
      streamRef.current;

  }

  screenTrackRef.current.stop();

  screenTrackRef.current = null;

  setIsSharing(false);

  console.log(
    "Camera Restored"
  );

};

// Start Recording
const startRecording = async () => {

  try {

    recordedChunksRef.current = [];

    const screenStream =
      await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
screenStream
  .getVideoTracks()[0]
  .onended = () => {

    stopRecording();

  };
    const recorder =
      new MediaRecorder(
        screenStream
      );

    mediaRecorderRef.current =
      recorder;

    recorder.ondataavailable =
      (event) => {

        if (
          event.data.size > 0
        ) {

          recordedChunksRef.current.push(
            event.data
          );

        }

      };

    recorder.start();

    setIsRecording(true);

    console.log(
      "Recording Started"
    );

  } catch (error) {

    console.log(
      "Recording Error:",
      error
    );

  }

};
//Stop Recording

const stopRecording = () => {

  if (!mediaRecorderRef.current) return;

  mediaRecorderRef.current.stop();

  mediaRecorderRef.current.onstop =
    () => {

      const blob =
        new Blob(
          recordedChunksRef.current,
          {
            type:
              "video/webm",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const a =
        document.createElement(
          "a"
        );

      a.href = url;

      a.download =
        "meeting-recording.webm";

      a.click();

      URL.revokeObjectURL(
        url
      );

      console.log(
        "Recording Saved"
      );

    };

  setIsRecording(false);

};

//
const raiseHand = () => {

  const newValue =
    !handRaised;

  setHandRaised(newValue);
setParticipants((prev) =>
  prev.map((participant) =>

    participant.name ===
    user?.name

      ? {
          ...participant,
          handRaised: newValue,
        }

      : participant
  )
);
  socket.emit(
    "raise-hand",
    {
      room: meetingCode,
      raised: newValue,
      name: user?.name,
    }
  );

};
  // =========================
  // Socket Events
  // =========================

  useEffect(() => {
    setParticipants([
  {
    id: socket.id || "me",
    name:  user?.name || "Guest",
     handRaised: false,
  },
]);
    console.log(
      "Meeting Code:",
      meetingCode
    );

    

    console.log(
      "Joining Room:",
      meetingCode
    );
    socket.off("notification");
socket.on(
  "notification",
  (data) => {
    console.log(
      "Notification:",
      data
    );
    
setNotifications((prev) => {

      const updated = [
        ...prev,
        data,
      ];

      console.log(
        "Updated Array:",
        updated
      );

      return updated;

    });
  }
);

    socket.on(
      "joined-successfully",
      (data) => {
        console.log(
          "Joined:",
          data
        );
      }
    );

    
const handleReceiveMessage = (
  data
) => {
  console.log(
    "Message Received:",
    data
  );

  setMessages((prev) => [
    ...prev,
    data,
  ]);
};

socket.on(
  "receive-message",
  handleReceiveMessage
);

socket.on(
  "offer",
  async (offer) => {

    console.log("Offer Received");

    if (!peerRef.current) return;

    if (
      peerRef.current.signalingState !==
      "stable"
    ) {
      console.log(
        "Skipping duplicate offer"
      );
      return;
    }

    await peerRef.current.setRemoteDescription(
      new RTCSessionDescription(
        offer
      )
    );

    const answer =
      await peerRef.current.createAnswer();

    await peerRef.current.setLocalDescription(
      answer
    );

    socket.emit(
      "answer",
      {
        answer,
        room: meetingCode,
      }
    );

    console.log("Answer Sent");

  }
);

socket.on(
  "answer",
  async (answer) => {

    console.log(
      "Answer Received"
    );

    if (
      peerRef.current &&
      peerRef.current.signalingState !==
        "stable"
    ) {

      if (!peerRef.current) {
  console.log(
    "Peer not ready yet"
  );
  return;
}
await peerRef.current.setRemoteDescription(
  new RTCSessionDescription(
    answer
  )
);

    }

  }
);
socket.on(
  "user-joined",
  async (data) => {
                 setParticipants((prev) => {

      const exists =
        prev.find(
          (p) =>
            p.id === data.userId
        );

      if (exists) return prev;

      return [
        ...prev,
        {
          id: data.userId,
          name:
            data.name,
            handRaised: false,
        },
      ];
    });
    console.log(
      "User Joined - Creating Offer"
    );

    if (!peerRef.current) return;
if (
      peerRef.current.signalingState !==
      "stable"
    ) return;

    const offer =
      await peerRef.current.createOffer();

    await peerRef.current.setLocalDescription(
      offer
    );

    socket.emit(
      "offer",
      {
        offer,
        room: meetingCode,
      }
    );

  }
);
socket.on(
  "participants-list",
  (users) => {

    const uniqueUsers =
      users.filter(
        (user, index, self) =>
          index ===
          self.findIndex(
            (u) =>
              u.id === user.id
          )
      );

    setParticipants(
      uniqueUsers.map(
        (user) => ({
          id: user.id,
          name: user.name,
          handRaised: false,
        })
      )
    );

  }
);

socket.on(
  "hand-raised",
  (data) => {

    setParticipants(
      (prev) =>
        prev.map(
          (participant) =>

            participant.name ===
            data.name

              ? {
                  ...participant,
                  handRaised:
                    data.raised,
                }

              : participant
        )
    );

  }
);
socket.on(
  "ice-candidate",
  async (candidate) => {

    console.log(
      "ICE Candidate Received"
    );

    if (
      peerRef.current &&
      peerRef.current.remoteDescription
    ) {

      await peerRef.current.addIceCandidate(
        new RTCIceCandidate(
          candidate
        )
      );

    }

  }
);
socket.off("user-left");

socket.on(
  "user-left",
  ({ userId }) => {

    console.log(
      "User Left:",
      userId
    );

    setParticipants(
      (prev) =>
        prev.filter(
          (user) =>
            user.id !== userId
        )
    );
if (
      remoteVideoRef.current
    ) {
      remoteVideoRef.current.srcObject =
        null;
    }
setNotifications(
  (prev) => [
    ...prev,
    {
      notification:
        "User left the meeting",
      time: new Date(),
    },
  ]
);
  }
);
    return () => {
      socket.off("offer");
socket.off("answer");
  socket.off("hand-raised");
socket.off("user-joined");
socket.off("participants-list");0
socket.off("joined-successfully");
  socket.off(
    "receive-message",
    handleReceiveMessage
  );
socket.off("user-left");
  socket.off(
    "notification"
  );
  socket.off(
  "ice-candidate"
);
socket.off("user-left");
};
  }, [meetingCode]);

  ///// media
useEffect(() => {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
      
    })
    .then((stream) => {
      console.log(
        "Media Access Granted"
      );

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream;
      }
      peerRef.current =
  new RTCPeerConnection({
    iceServers: [
      {
        urls:
          "stun:stun.l.google.com:19302",
      },
    ],
  });

console.log(
  "Peer Connection Created"
);
stream.getTracks().forEach(
  (track) => {
    peerRef.current.addTrack(
      track,
      stream
    );
  }
);

console.log("Tracks Added");
socket.emit(
  "join-meeting",
  {
    meetingCode,
    name: user?.name || "Guest",
  }
);
peerRef.current.onconnectionstatechange =
  () => {

    console.log(
      "Peer State:",
      peerRef.current.connectionState
    );

  };
peerRef.current.ontrack = (event) => {

  console.log(
    "Remote Track Received"
  );

  console.log(
    "Streams:",
    event.streams
  );

  console.log(
    "Remote Ref:",
    remoteVideoRef.current
  );

  if (
    remoteVideoRef.current &&
    event.streams[0]
  ) {

    remoteVideoRef.current.srcObject =
      event.streams[0];

    

    console.log(
      "Remote Stream Attached"
    );

  }

};
  peerRef.current.onnegotiationneeded =
  async () => {

    console.log(
      "Negotiation Needed"
    );

  };
  peerRef.current.onicecandidate =
  (event) => {

    if (event.candidate) {

      console.log(
        "ICE Candidate Generated"
      );

      socket.emit(
        "ice-candidate",
        {
          candidate:
            event.candidate,
          room: meetingCode,
        }
      );

    }

  };
  
    })
    .catch((err) => {
      console.log(
        "Media Error:",
        err
      );
    });
    return () => {
      console.log(
    "Cleaning Peer"
  );
peerRef.current?.close();
  streamRef.current
    ?.getTracks()
    .forEach(track => track.stop());

  

};
}, []);
//notification
useEffect(() => {
  console.log(
    "Notifications Updated:",
    notifications
  );
}, [notifications]);

//
useEffect(() => {
  console.log(
    "Participants:",
    participants
  );
}, [participants]);

//


  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="bg-gray-800 p-6 rounded-xl mb-6 shadow-lg">
  <h1 className="text-4xl font-bold">
    Meeting Room
  </h1>
<p className="mt-2 text-lg">
  Welcome,
  <span className="font-bold ml-2 text-yellow-400">
    {user?.name}
  </span>
</p>
  <p className="mt-3 text-lg">
    Meeting Code:
    <span className="font-bold ml-2 text-green-400">
      {meetingCode}
    </span>
  </p>

  <p className="mt-2 text-lg">
    Participants:
    <span className="font-bold ml-2 text-blue-400">
      {participants.length}
    </span>
  </p>
</div>
<div className="bg-gray-800 p-4 rounded-xl mb-6">
  <h2 className="text-2xl font-bold mb-3">
    Participants
  </h2>

  {participants.map((participant) => (
    <div
      key={participant.id}
      className="flex items-center gap-2 mb-2"
    >
      <span>🟢</span>

      <span>
        {participant.name}
      </span>
    </div>
  ))}
</div>
<div className="flex gap-4 mb-6">
      <button
  onClick={toggleMute}
  className="bg-blue-500 px-4 py-2 rounded mb-4"
>
  {isMuted
    ? "🎤 Unmute"
    : "🎤 Mute"}
</button>
<button
  onClick={toggleCamera}
  className="bg-green-500 px-4 py-2 rounded mb-4 ml-4"
>
  {cameraOff
    ? "📷 Camera On"
    : "📷 Camera Off"}
</button>
<button
   onClick={
    isSharing
      ? stopSharing
      : shareScreen
  }
  className="bg-purple-500 px-4 py-2 rounded"
>
 {
  isSharing
    ? "🛑 Stop Sharing"
    : "🖥️ Share Screen"
}
</button>
<button
  onClick={raiseHand}
  className="bg-yellow-500 px-4 py-2 rounded"
>
  {handRaised
    ? "👇 Lower Hand"
    : "✋ Raise Hand"}
</button>
<button
  onClick={
    isRecording
      ? stopRecording
      : startRecording
  }
  className="bg-pink-500 px-4 py-2 rounded"
>
  {isRecording
    ? "⏹ Stop Recording"
    : "🎥 Start Recording"}
</button>
<button
  onClick={leaveMeeting}
  className="bg-red-500 px-4 py-2 rounded mb-4 ml-4"
>
  🚪 Leave Meeting
</button>
</div>
      <div className="grid grid-cols-4 gap-6">

  {/* Participants */}
  

    {participants.map((participant) => (
  <div
    key={participant.id}
    className="flex items-center justify-between mb-2"
  >
    <span>
      🟢 {participant.name}
    </span>

    <div>
      {participant.handRaised && "✋ "}

      {participant.name === user?.name && (
        <>
          {isMuted ? "🔇" : "🎤"}{" "}
          {cameraOff ? "📴" : "📷"}{" "}
          {isSharing ? "🖥️" : ""}
        </>
      )}
    </div>
  </div>
))}

  {/* Video Area */}
  <div className="col-span-3">
    <VideoRoom
      localVideoRef={videoRef}
      remoteVideoRef={remoteVideoRef}
    />
  </div>

</div>
<div className="bg-gray-800 p-4 rounded-xl mb-6">
  <h2 className="text-2xl font-bold mb-3">
    Notifications
  </h2>

  {notifications.length === 0 ? (
    <p>No notifications</p>
  ) : (
    notifications.map((item, index) => (
      <div
  key={index}
  className="bg-gray-700 p-2 rounded mb-2"
>
  <p>{item.notification}</p>

  <p className="text-xs text-gray-400">
    {new Date(
      item.time
    ).toLocaleTimeString()}
  </p>
</div>
    ))
  )}
</div>
<div className="mt-6">
  <ChatBox
    message={message}
    setMessage={setMessage}
    sendMessage={sendMessage}
    messages={messages}
  />
</div>
    </div>
  );
}

export default Meeting;
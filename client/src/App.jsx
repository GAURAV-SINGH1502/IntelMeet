import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { useEffect } from "react";
import socket from "./socket";
import { useRef } from "react";
//import Peer from "simple-peer";
function App() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const peerRef = useRef(null);
  const remoteVideoRef = useRef(null);
 useEffect(() => {
  navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  
  .then((stream) => {
    console.log("Media Access Granted");
    streamRef.current = stream;
     if (videoRef.current) {
    videoRef.current.srcObject = stream;
  }
  peerRef.current = new RTCPeerConnection({
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
});

console.log("Peer Connection Created");
stream.getTracks().forEach((track) => {

  peerRef.current.addTrack(
    track,
    stream
  );

});

console.log("Tracks Added");
peerRef.current.onicecandidate = (event) => {

  if (event.candidate) {

    console.log(
      "ICE Candidate Generated"
    );
     socket.emit(
      "ice-candidate",
      {
        candidate: event.candidate,
        room: "TEST123"
      }
    );

  }

};
peerRef.current.createOffer()
  .then((offer) => {

    return peerRef.current
      .setLocalDescription(offer);

  })
  .then(() => {

    console.log(
      "Offer Created"
    );
    socket.on(
  "ice-candidate",
  async (candidate) => {

    console.log(
      "ICE Candidate Received"
    );

    await peerRef.current.addIceCandidate(
      new RTCIceCandidate(candidate)
    );

  }
);
socket.emit(
  "offer",
  {
    offer: peerRef.current.localDescription,
    room: "TEST123"
  }
);
  });
peerRef.current.ontrack = (event) => {

  console.log("Remote Track Received");

  if (remoteVideoRef.current) {

    remoteVideoRef.current.srcObject =
      event.streams[0];

  }

};
    console.log(stream);
  })
  .catch((err) => {
    console.log("Media Error:", err);
  });
socket.on(
  "joined-successfully",
  (data) => {
    console.log(data);
  }
);
socket.on("answer", async (answer) => {

  console.log("Answer Received");

  await peerRef.current.setRemoteDescription(
    new RTCSessionDescription(answer)
  );

});
socket.on("offer", async (offer) => {

  console.log(
    "Offer Received From Peer"
  );

  await peerRef.current.setRemoteDescription(
    new RTCSessionDescription(offer)
  );

  const answer =
    await peerRef.current.createAnswer();

  await peerRef.current.setLocalDescription(
    answer
  );

  console.log("Answer Created");
  console.log(answer);
  console.log("Sending Answer");
socket.emit(
    "answer",
    {
      answer,
      room: "TEST123"
    }
  );
});
socket.on(
  "user-joined",
  (data) => {
    console.log("New User:", data);
  }
);
  socket.on("connect", () => {

    console.log("Connected:", socket.id);

    socket.emit(
      "join-meeting",
      "TEST123"
    );

  });

  socket.on("welcome", (data) => {
    console.log(data);
  });

}, []);
  return (
    <>
  <h1>IntellMeet Frontend Working</h1>

  <video
    ref={videoRef}
    autoPlay
    playsInline
    muted
    width="400"
  />
  <h2>Remote Video</h2>

<video
  ref={remoteVideoRef}
  autoPlay
  playsInline
  width="400"
/>
</>
  )
}

export default App
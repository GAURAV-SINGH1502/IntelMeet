import { useRef, useEffect } from "react";

function VideoRoom({
  localVideoRef,
  remoteVideoRef,
}) {
  return (
    <div className="flex gap-6">
      <div>
        <h2 className="text-xl font-bold mb-2">
          Local Video
        </h2>

        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          width="400"
          className="rounded-lg border"
        />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">
          Remote Video
        </h2>

        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          width="400"
          className="rounded-lg border"
        />
      </div>
    </div>
  );
}

export default VideoRoom;
import React, { useEffect, useRef, useState } from "react";
import {
  loadFaceModels,
  detectFaceFromVideo,
  getAverageEAR,
} from "../utils/faceApiHelpers";

const EAR_BLINK_THRESHOLD = 0.23; // below this = eyes considered "closed"

/**
 * Reusable webcam + face capture component.
 *
 * Props:
 *  - onCapture(descriptorArray): called once a live face is captured successfully
 *  - buttonLabel: text for the capture button
 */
export default function FaceCapture({ onCapture, buttonLabel = "Capture Face" }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("loading-models");
  const [livenessConfirmed, setLivenessConfirmed] = useState(false);
  const [error, setError] = useState("");
  const wasClosedRef = useRef(false);

  useEffect(() => {
    let stream;
    let livenessInterval;

    const init = async () => {
      try {
        await loadFaceModels();
        setStatus("starting-camera");

        stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus("ready");

        // Poll for a blink every 300ms to confirm liveness before allowing capture
        livenessInterval = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState !== 4) return;
          const result = await detectFaceFromVideo(videoRef.current);
          if (!result) return;

          const ear = getAverageEAR(result.landmarks);
          if (ear < EAR_BLINK_THRESHOLD) {
            wasClosedRef.current = true; // eyes just closed
          } else if (wasClosedRef.current && ear >= EAR_BLINK_THRESHOLD) {
            // eyes were closed and are now open again -> that's a blink
            wasClosedRef.current = false;
            setLivenessConfirmed(true);
          }
        }, 300);
      } catch (err) {
        console.error(err);
        setError("Could not access camera. Please allow camera permission and reload.");
        setStatus("error");
      }
    };

    init();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (livenessInterval) clearInterval(livenessInterval);
    };
  }, []);

  const handleCapture = async () => {
    setError("");
    if (!livenessConfirmed) {
      setError("Please blink naturally at the camera first, so we can confirm you're a live person.");
      return;
    }
    const result = await detectFaceFromVideo(videoRef.current);
    if (!result) {
      setError("No face detected. Please center your face in the frame and try again.");
      return;
    }
    onCapture(result.descriptor);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="360"
        height="270"
        style={{ borderRadius: 8, background: "#000", transform: "scaleX(-1)" }}
      />
      <p>
        {status === "loading-models" && "Loading face recognition models..."}
        {status === "starting-camera" && "Starting camera..."}
        {status === "ready" &&
          (livenessConfirmed ? "Liveness confirmed - you may capture now." : "Please blink naturally...")}
      </p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleCapture} disabled={status !== "ready"}>
        {buttonLabel}
      </button>
    </div>
  );
}

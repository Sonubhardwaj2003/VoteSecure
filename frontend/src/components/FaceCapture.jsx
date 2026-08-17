import React, { useEffect, useRef, useState } from "react";
import { Camera, Loader2, ScanFace } from "lucide-react";
import {
  loadFaceModels,
  detectFaceFromVideo,
  detectLandmarksFromVideo,
  getAverageEAR,
} from "../utils/faceApiHelpers";
import Alert from "./Alert";

const EAR_BLINK_THRESHOLD = 0.23; // below this = eyes considered "closed"

const STATUS_TEXT = {
  "loading-models": "Loading face recognition models…",
  "starting-camera": "Starting camera…",
};

/**
 * Reusable webcam + face capture component.
 *
 * Props:
 *  - onCapture(descriptorArray): called once a live face is captured successfully
 *  - buttonLabel: text for the capture button
 */
export default function FaceCapture({
  onCapture,
  buttonLabel = "Capture Face",
}) {
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

        // Poll for a blink using the lightweight (landmarks-only) detector so
        // this loop stays fast — the heavy face-descriptor computation only
        // happens once, at actual capture time.
        let detecting = false;
        livenessInterval = setInterval(async () => {
          if (detecting) return; // avoid overlapping calls on slower devices
          if (!videoRef.current || videoRef.current.readyState !== 4) return;
          detecting = true;
          try {
            const result = await detectLandmarksFromVideo(videoRef.current);
            if (!result) return;

            const ear = getAverageEAR(result.landmarks);
            if (ear < EAR_BLINK_THRESHOLD) {
              wasClosedRef.current = true; // eyes just closed
            } else if (wasClosedRef.current && ear >= EAR_BLINK_THRESHOLD) {
              // eyes were closed and are now open again -> that's a blink
              wasClosedRef.current = false;
              setLivenessConfirmed(true);
            }
          } finally {
            detecting = false;
          }
        }, 120);
      } catch (err) {
        console.error(err);
        setError(
          "Could not access camera. Please allow camera permission and reload.",
        );
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
      setError(
        "Please blink naturally at the camera first, so we can confirm you're a live person.",
      );
      return;
    }

    const result = await detectFaceFromVideo(videoRef.current);

    if (!result || result.error === "no-face") {
      setError(
        "No face detected. Please center your face in the frame and try again.",
      );
      return;
    }
    if (result.error === "multiple-faces") {
      setError(
        `${result.count} faces detected in frame. Please make sure only YOU are visible to the camera and try again.`,
      );
      return;
    }

    onCapture(result.descriptor);
  };

  const isBusy = status === "loading-models" || status === "starting-camera";
  const readyMessage =
    status === "ready" &&
    (livenessConfirmed
      ? "Liveness confirmed — you may capture now."
      : "Please blink naturally…");

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="relative">
        <div
          className={`absolute -inset-1 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 opacity-0 blur transition-opacity duration-500 ${
            livenessConfirmed ? "opacity-40" : ""
          }`}
        />
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="relative h-56 w-72 rounded-lg bg-ink-900 object-cover shadow-inner [transform:scaleX(-1)] sm:h-64 sm:w-80"
        />

        {isBusy && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-ink-900/70 text-white">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-xs font-medium">{STATUS_TEXT[status]}</span>
          </div>
        )}

        {status === "ready" && (
          <span
            className={`absolute right-2 top-2 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
              livenessConfirmed
                ? "bg-emerald-500 text-white"
                : "bg-amber-400 text-ink-900"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full bg-white ${!livenessConfirmed ? "animate-pulse-ring" : ""}`}
            />
            {livenessConfirmed ? "Live" : "Blink to verify"}
          </span>
        )}
      </div>

      {readyMessage && (
        <p
          className={`flex items-center gap-1.5 text-sm font-medium ${
            livenessConfirmed ? "text-emerald-600" : "text-slate-500"
          }`}
        >
          <ScanFace className="h-4 w-4" />
          {readyMessage}
        </p>
      )}

      {error && <Alert message={error} tone="error" />}

      <button
        type="button"
        onClick={handleCapture}
        disabled={status !== "ready"}
        className="btn-primary w-full sm:w-auto"
      >
        <Camera className="h-4 w-4" />
        {buttonLabel}
      </button>
    </div>
  );
}

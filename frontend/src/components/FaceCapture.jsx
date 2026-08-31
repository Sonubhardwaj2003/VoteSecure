import React, { useEffect, useRef, useState } from "react";
import { Camera, Loader2, ScanFace, AlertTriangle } from "lucide-react";
import {
  loadFaceModels,
  detectFaceFromVideo,
  detectLiveFaceStatus,
  getAverageEAR,
} from "../utils/faceApiHelpers";
import Alert from "./Alert";

const EAR_BLINK_THRESHOLD = 0.23;

const STATUS_TEXT = {
  "loading-models": "Loading face recognition models…",
  "starting-camera": "Starting camera…",
};

export default function FaceCapture({ onCapture, buttonLabel = "Capture Face" }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("loading-models");
  const [livenessConfirmed, setLivenessConfirmed] = useState(false);
  const [faceCount, setFaceCount] = useState(0); // live count, updated every poll tick
  const [error, setError] = useState("");
  const wasClosedRef = useRef(false);
  const faceCountRef = useRef(0); // avoids stale-closure reads inside the interval

  useEffect(() => {
    let stream;
    let pollInterval;

    const init = async () => {
      try {
        await loadFaceModels();
        setStatus("starting-camera");

        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 480 }, height: { ideal: 360 }, facingMode: "user" },
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus("ready");

        pollInterval = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState !== 4) return;

          const { count, landmarks } = await detectLiveFaceStatus(videoRef.current);
          faceCountRef.current = count;
          setFaceCount(count);

          // Only track blink/liveness while exactly one face is present —
          // liveness from a frame with 0 or 2+ faces is meaningless.
          if (count !== 1 || !landmarks) return;

          const ear = getAverageEAR(landmarks);
          if (ear < EAR_BLINK_THRESHOLD) {
            wasClosedRef.current = true;
          } else if (wasClosedRef.current && ear >= EAR_BLINK_THRESHOLD) {
            wasClosedRef.current = false;
            setLivenessConfirmed(true);
          }
        }, 120);
      } catch (err) {
        console.error(err);
        setError("Could not access camera. Please allow camera permission and reload.");
        setStatus("error");
      }
    };

    init();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const handleCapture = async () => {
    setError("");

    // Defense-in-depth: re-validate at the exact moment of capture too,
    // not just trust the last polled state (closes any last-instant race
    // where a second person steps in between poll ticks).
    if (faceCountRef.current !== 1) {
      setError(
        faceCountRef.current === 0
          ? "No face detected. Please position your face clearly in front of the camera."
          : "Multiple faces detected. Please ensure only one person is visible in the camera."
      );
      return;
    }
    if (!livenessConfirmed) {
      setError("Please blink naturally at the camera first, so we can confirm you're a live person.");
      return;
    }

    const result = await detectFaceFromVideo(videoRef.current);
    if (!result || result.error === "no-face") {
      setError("No face detected. Please center your face in the frame and try again.");
      return;
    }
    if (result.error === "multiple-faces") {
      setError(
        `${result.count} faces detected in frame. Please make sure only YOU are visible to the camera and try again.`
      );
      return;
    }

    onCapture(result.descriptor);
  };

  const isBusy = status === "loading-models" || status === "starting-camera";
  const canCapture = status === "ready" && faceCount === 1 && livenessConfirmed;

  let liveMessage = null;
  let liveTone = "info";
  if (status === "ready") {
    if (faceCount === 0) {
      liveMessage = "No face detected. Please position your face clearly in front of the camera.";
      liveTone = "warn";
    } else if (faceCount > 1) {
      liveMessage = `${faceCount} faces detected! Please ensure only one person is visible in the camera.`;
      liveTone = "error";
    } else if (!livenessConfirmed) {
      liveMessage = "Please blink naturally…";
      liveTone = "info";
    } else {
      liveMessage = "Liveness confirmed — you may capture now.";
      liveTone = "success";
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="relative">
        <div
          className={`absolute -inset-1 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 opacity-0 blur transition-opacity duration-500 ${
            livenessConfirmed && faceCount === 1 ? "opacity-40" : ""
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

        {status === "ready" && faceCount > 1 && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-rose-900/60">
            <span className="flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
              <AlertTriangle className="h-3.5 w-3.5" />
              Multiple faces
            </span>
          </div>
        )}

        {status === "ready" && faceCount === 1 && (
          <span
            className={`absolute right-2 top-2 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
              livenessConfirmed ? "bg-emerald-500 text-white" : "bg-amber-400 text-ink-900"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full bg-white ${!livenessConfirmed ? "animate-pulse-ring" : ""}`}
            />
            {livenessConfirmed ? "Live" : "Blink to verify"}
          </span>
        )}
      </div>

      {liveMessage && (
        <p
          className={`flex items-center gap-1.5 text-sm font-medium ${
            liveTone === "error"
              ? "text-rose-600"
              : liveTone === "warn"
              ? "text-amber-600"
              : liveTone === "success"
              ? "text-emerald-600"
              : "text-slate-500"
          }`}
        >
          {liveTone === "error" || liveTone === "warn" ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <ScanFace className="h-4 w-4" />
          )}
          {liveMessage}
        </p>
      )}

      {error && <Alert message={error} tone="error" />}

      <button
        type="button"
        onClick={handleCapture}
        disabled={!canCapture}
        className="btn-primary w-full sm:w-auto"
      >
        <Camera className="h-4 w-4" />
        {buttonLabel}
      </button>
    </div>
  );
}

import * as tf from "@tensorflow/tfjs";
import * as faceapi from "face-api.js";
console.log("TensorFlow Version:", tf.version.tfjs);
console.log("Backend:", tf.getBackend());

const MODEL_URL = process.env.PUBLIC_URL + "/models";

let modelsLoaded = false;

// Load the three models we need. Call this once when the app starts
// (e.g. in a useEffect on the page that needs the camera).
export const loadFaceModels = async () => {
  if (modelsLoaded) return;

  await tf.ready();

  if (tf.findBackend("webgl")) {
    await tf.setBackend("webgl");
  } else {
    await tf.setBackend("cpu");
  }

  console.log("Backend:", tf.getBackend());

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);

  modelsLoaded = true;
};

// Detects a single face in a <video> element and returns:
// - descriptor: 128-length Float32Array (converted to plain array for JSON)
// - landmarks: for liveness/blink checks
// This is the "expensive" call (computes the full recognition descriptor) -
// only use it once, at the moment of actual capture.
// Full-quality detection used only at the moment of "Capture" (Login/Register).
// Detects ALL faces in frame — not just the most confident one — so we can
// reject the capture outright if more than one person is visible. Silently
// picking "the most confident face" when two people are in frame is exactly
// the bug this fixes.
export const detectFaceFromVideo = async (video) => {
  const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (detections.length === 0) {
    return { error: "no-face" };
  }
  if (detections.length > 1) {
    return { error: "multiple-faces", count: detections.length };
  }

  const [detection] = detections;
  return {
    descriptor: Array.from(detection.descriptor),
    landmarks: detection.landmarks,
  };
};

// Lightweight, continuous polling detector — runs every ~120ms while the
// camera preview is live. Detects ALL faces (not just one) so we can show
// a real-time face-count status, not just check once at capture time.
export const detectLiveFaceStatus = async (video) => {
  const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
    .withFaceLandmarks();

  return {
    count: detections.length,
    landmarks: detections.length === 1 ? detections[0].landmarks : null,
  };
};

// --- Basic liveness: Eye Aspect Ratio (EAR) based blink detection ---
// EAR drops sharply when eyes close. We sample EAR over ~2-3 seconds; if it
// dips below a threshold and recovers, we count that as a real blink -
// which a static photo held up to the camera cannot produce.
function distance(pt1, pt2) {
  return Math.hypot(pt1.x - pt2.x, pt1.y - pt2.y);
}

export function calculateEAR(eyePoints) {
  // eyePoints: array of 6 {x,y} landmark points for one eye
  const vertical1 = distance(eyePoints[1], eyePoints[5]);
  const vertical2 = distance(eyePoints[2], eyePoints[4]);
  const horizontal = distance(eyePoints[0], eyePoints[3]);
  return (vertical1 + vertical2) / (2.0 * horizontal);
}

export function getAverageEAR(landmarks) {
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  const leftEAR = calculateEAR(leftEye);
  const rightEAR = calculateEAR(rightEye);
  return (leftEAR + rightEAR) / 2;
}

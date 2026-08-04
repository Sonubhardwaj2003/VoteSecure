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
export const detectFaceFromVideo = async (videoEl) => {
  const detection = await faceapi
    .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;

  return {
    descriptor: Array.from(detection.descriptor),
    landmarks: detection.landmarks,
  };
};

// Lightweight version used for the liveness/blink polling loop: skips the
// expensive descriptor computation entirely (we only need eye landmarks
// here) and uses a smaller detector input size for faster inference. This
// is what makes blink detection feel near-instant instead of laggy.
export const detectLandmarksFromVideo = async (videoEl) => {
  const detection = await faceapi
    .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
    .withFaceLandmarks();

  if (!detection) return null;

  return { landmarks: detection.landmarks };
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

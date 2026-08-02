# Face-api.js models go here

This folder must contain the pretrained model weight files that `face-api.js`
loads in the browser. They are NOT included in this project (they're ~10-15MB
of binary weight files) — download them once, and this folder will look like:

```
public/models/
  tiny_face_detector_model-weights_manifest.json
  tiny_face_detector_model-shard1
  face_landmark_68_model-weights_manifest.json
  face_landmark_68_model-shard1
  face_recognition_model-weights_manifest.json
  face_recognition_model-shard1
  face_recognition_model-shard2
```

## How to download

**Option A — clone just the models (recommended):**

```bash
git clone --depth 1 https://github.com/justadudewhohacks/face-api.js.git temp-faceapi
cp temp-faceapi/weights/tiny_face_detector_model-* public/models/
cp temp-faceapi/weights/face_landmark_68_model-* public/models/
cp temp-faceapi/weights/face_recognition_model-* public/models/
rm -rf temp-faceapi
```

**Option B — download manually:**
Go to https://github.com/justadudewhohacks/face-api.js/tree/master/weights
and download these files individually into this folder:
- `tiny_face_detector_model-weights_manifest.json` + `tiny_face_detector_model-shard1`
- `face_landmark_68_model-weights_manifest.json` + `face_landmark_68_model-shard1`
- `face_recognition_model-weights_manifest.json` + `face_recognition_model-shard1` + `face_recognition_model-shard2`

The app will not work until these files are in place — `loadFaceModels()` in
`src/utils/faceApiHelpers.js` fetches them from `/models` at runtime.

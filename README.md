# VoteSecure : AI-powered Online Voting System with Face Recognition & Two-Factor Authentication

A full-stack final-year project: voters register with a face capture, log in
using **face match + OTP (2FA)**, and cast a vote for candidates in their
constituency. Admin verifies voters and manages candidates. Live results are
public.

## Tech Stack
- **Frontend:** React, React Router, Axios, `face-api.js` (TensorFlow.js face detection/recognition — runs in the browser, no Python needed)
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Nodemailer (OTP email)
- **Face matching:** Euclidean distance between 128-d face descriptors (generated client-side by face-api.js)
- **Liveness check:** Blink detection (Eye Aspect Ratio) — prevents someone from just holding up a photo

## How the flow works
1. **Register** → voter fills a form + face-api.js captures a face descriptor in the browser → sent to backend, stored in MongoDB
2. **Admin verifies** the voter (basic anti-fraud step — you're simulating an election officer approving voter rolls)
3. **Login (Step 1)** → voter enters Voter ID, camera captures live face + confirms a blink happened (liveness) → backend compares descriptor via Euclidean distance
4. **Login (Step 2)** → if face matches, OTP is emailed → voter enters OTP → JWT issued
5. **Vote** → voter sees candidates for their constituency, votes once (`hasVoted` flag prevents double voting)
6. **Results** → public, live-refreshing vote tally

---

## Folder Structure
```
voting-system/
  backend/
    config/db.js
    models/            (Voter, Candidate, Vote, Admin, Otp)
    controllers/        (auth, vote, candidate, admin logic)
    routes/
    middleware/authMiddleware.js
    utils/               (JWT, OTP email, face matching math)
    server.js
    seedAdmin.js
    .env.example
  frontend/
    src/
      components/       (FaceCapture, Navbar)
      pages/            (Register, Login, Vote, Results, AdminDashboard)
      utils/            (api.js, faceApiHelpers.js)
      App.jsx, index.js
    public/models/      (face-api.js model weights go here - see instructions)
```

---

## Step 1: Install prerequisites
- Node.js (v18+) — https://nodejs.org
- MongoDB — either:
  - **MongoDB Atlas** (free, cloud, recommended — also supports transactions out of the box), or
  - **Local MongoDB** installed on your machine

> **Note on transactions:** `voteController.js` uses a MongoDB transaction to
> atomically record the vote + increment the count + mark the voter as
> voted. Transactions require MongoDB to be running as a replica set.
> **MongoDB Atlas's free tier already is one** — so if you're not sure, just
> use Atlas and you won't need to configure anything extra.

## Step 2: Backend setup
```bash
cd backend
npm install
cp .env.example .env
```
Now edit `.env`:
- `MONGO_URI` → your Atlas connection string or local Mongo URI
- `JWT_SECRET` → any long random string
- `EMAIL_USER` / `EMAIL_PASS` → a Gmail address + an **App Password**
  (not your normal password). Generate one at:
  https://myaccount.google.com/apppasswords (requires 2-Step Verification
  enabled on that Gmail account)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` → credentials for your first admin login

Create the first admin account:
```bash
node seedAdmin.js
```

Start the backend:
```bash
npm run dev
```
It should print `Server running on port 5000` and `MongoDB connected: ...`.

## Step 3: Download face-api.js models
```bash
cd ../frontend
git clone --depth 1 https://github.com/justadudewhohacks/face-api.js.git temp-faceapi
cp temp-faceapi/weights/tiny_face_detector_model-* public/models/
cp temp-faceapi/weights/face_landmark_68_model-* public/models/
cp temp-faceapi/weights/face_recognition_model-* public/models/
rm -rf temp-faceapi
```
(See `frontend/public/models/README.md` for the manual-download alternative.)

## Step 4: Frontend setup
```bash
npm install
cp .env.example .env
npm start
```
This opens `http://localhost:3000`. Your backend must already be running on port 5000.

## Step 5: Try the full flow
1. Go to `/register`, fill the form, capture your face (blink when prompted), submit
2. Go to `/admin`, log in with the admin credentials from your `.env`, click **Verify** next to your new voter
3. Add at least one candidate in the same constituency you registered under
4. Go to `/` (Login), enter your Voter ID, capture your face again, enter the OTP emailed to you
5. Go to `/vote`, cast your vote
6. Go to `/results` to see the live tally

---

## Security notes worth including in your project report
This is a **proof-of-concept for accessible/remote voting** (e.g. for
migrant workers, NRIs, or people with disabilities), not a production
replacement for national elections. Be upfront about the limitations —
evaluators respect this more than an overclaim:
- **Deepfake/spoofing risk:** blink-based liveness helps against static
  photos but won't stop a sophisticated video deepfake. Production systems
  would need stronger liveness models (e.g. 3D depth sensing, challenge-response).
- **No physical audit trail:** unlike EVMs with VVPAT paper slips, there's
  no independent paper record here.
- **Coercion risk:** voting from home means no one can guarantee privacy
  the way a polling booth can.
- **Network security:** a networked system has a larger attack surface than
  standalone EVMs.

## Possible extensions (good "future scope" talking points)
- Add blockchain-based vote storage (hash-chain ledger) for tamper-evidence
- Add SMS OTP (Twilio) as an alternative to email
- Rate-limit face/OTP attempts to prevent brute forcing
- Admin analytics dashboard (turnout by constituency, etc.)
- Dockerize the whole stack for one-command deployment

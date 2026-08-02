import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FaceCapture from "../components/FaceCapture";
import api from "../utils/api";

export default function Login() {
  const [voterId, setVoterId] = useState("");
  const [step, setStep] = useState("face"); // "face" -> "otp"
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFaceCapture = async (descriptor) => {
    if (!voterId) {
      setMessage("Please enter your Voter ID first.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/auth/login/face", { voterId, faceDescriptor: descriptor });
      setMaskedEmail(res.data.maskedEmail);
      setMessage(res.data.message);
      setStep("otp");
    } catch (err) {
      setMessage(err.response?.data?.message || "Face verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/auth/login/verify-otp", { voterId, code: otp });
      localStorage.setItem("voterToken", res.data.token);
      localStorage.setItem("voter", JSON.stringify(res.data.voter));
      navigate("/vote");
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
      <h2>Voter Login</h2>

      {step === "face" && (
        <>
          <input
            placeholder="Enter your Voter ID"
            value={voterId}
            onChange={(e) => setVoterId(e.target.value)}
            style={{ width: "100%", marginBottom: 12, padding: 8 }}
          />
          <FaceCapture buttonLabel="Verify Face" onCapture={handleFaceCapture} />
        </>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p>Enter the 6-digit OTP sent to {maskedEmail}</p>
          <input
            placeholder="OTP Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Login"}
          </button>
        </form>
      )}

      {loading && step === "face" && <p>Checking face...</p>}
      {message && <p>{message}</p>}
    </div>
  );
}

import React, { useState } from "react";
import FaceCapture from "../components/FaceCapture";
import api from "../utils/api";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    voterId: "",
    email: "",
    phone: "",
    constituency: "",
    dateOfBirth: "",
  });
  const [descriptor, setDescriptor] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!descriptor) {
      setMessage("Please capture your face before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/auth/register", { ...form, faceDescriptor: descriptor });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
      <h2>Voter Registration</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input name="fullName" placeholder="Full Name" onChange={handleChange} required />
        <input name="voterId" placeholder="Voter ID (e.g. mock Aadhaar number)" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} required />
        <input name="constituency" placeholder="Constituency" onChange={handleChange} required />
        <input name="dateOfBirth" type="date" onChange={handleChange} required />

        <h4>Step 2: Capture your face</h4>
        <FaceCapture
          buttonLabel="Capture & Save Face"
          onCapture={(d) => {
            setDescriptor(d);
            setMessage("Face captured. You can now submit the form.");
          }}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Register"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

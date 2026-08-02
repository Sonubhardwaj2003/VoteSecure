import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("adminToken"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [voters, setVoters] = useState([]);
  const [newCandidate, setNewCandidate] = useState({ name: "", party: "", constituency: "" });
  const [message, setMessage] = useState("");

  const loadVoters = () => {
    api.get("/admin/voters").then((res) => setVoters(res.data));
  };

  useEffect(() => {
    if (loggedIn) loadVoters();
  }, [loggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/login", { email, password });
      localStorage.setItem("adminToken", res.data.token);
      setLoggedIn(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  const handleVerify = async (id) => {
    await api.patch(`/admin/voters/${id}/verify`);
    loadVoters();
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/candidates", newCandidate);
      setMessage("Candidate added");
      setNewCandidate({ name: "", party: "", constituency: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add candidate");
    }
  };

  if (!loggedIn) {
    return (
      <div style={{ maxWidth: 360, margin: "0 auto", padding: 24 }}>
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <h2>Admin Dashboard</h2>

      <h3>Add Candidate</h3>
      <form onSubmit={handleAddCandidate} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          placeholder="Name"
          value={newCandidate.name}
          onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
        />
        <input
          placeholder="Party"
          value={newCandidate.party}
          onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
        />
        <input
          placeholder="Constituency"
          value={newCandidate.constituency}
          onChange={(e) => setNewCandidate({ ...newCandidate, constituency: e.target.value })}
        />
        <button type="submit">Add</button>
      </form>

      <h3>Pending Voter Verifications</h3>
      {voters.map((v) => (
        <div key={v._id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 8, borderRadius: 8 }}>
          <p>
            <strong>{v.fullName}</strong> ({v.voterId}) - {v.constituency}
          </p>
          <p>Verified: {v.isVerified ? "Yes" : "No"} | Voted: {v.hasVoted ? "Yes" : "No"}</p>
          {!v.isVerified && <button onClick={() => handleVerify(v._id)}>Verify</button>}
        </div>
      ))}
      {message && <p>{message}</p>}
    </div>
  );
}

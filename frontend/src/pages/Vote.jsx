import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function Vote() {
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState("");
  const [voted, setVoted] = useState(false);
  const voter = JSON.parse(localStorage.getItem("voter") || "null");

  useEffect(() => {
    if (!voter) return;
    api
      .get(`/candidates?constituency=${encodeURIComponent(voter.constituency)}`)
      .then((res) => setCandidates(res.data))
      .catch(() => setMessage("Could not load candidates"));
  }, [voter]);

  if (!voter) {
    return <p style={{ padding: 24 }}>Please log in first.</p>;
  }

  const handleVote = async (candidateId) => {
    if (!window.confirm("Confirm your vote? This action cannot be undone.")) return;
    try {
      const res = await api.post("/vote/cast", { candidateId });
      setMessage(res.data.message);
      setVoted(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Vote failed");
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
      <h2>Welcome, {voter.fullName}</h2>
      <p>Constituency: {voter.constituency}</p>

      {voted || voter.hasVoted ? (
        <p>You have already cast your vote. Thank you for participating!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {candidates.map((c) => (
            <div key={c._id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
              <strong>{c.name}</strong> ({c.party})
              <button style={{ float: "right" }} onClick={() => handleVote(c._id)}>
                Vote
              </button>
            </div>
          ))}
          {candidates.length === 0 && <p>No candidates found for your constituency yet.</p>}
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

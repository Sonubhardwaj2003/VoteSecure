import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function Results() {
  const [data, setData] = useState({ totalVotes: 0, candidates: [] });
  const [constituency, setConstituency] = useState("");

  const fetchResults = () => {
    api
      .get(`/vote/results${constituency ? `?constituency=${encodeURIComponent(constituency)}` : ""}`)
      .then((res) => setData(res.data));
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 5000); // live-ish refresh
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [constituency]);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
      <h2>Live Results</h2>
      <input
        placeholder="Filter by constituency"
        value={constituency}
        onChange={(e) => setConstituency(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />
      <p>Total votes: {data.totalVotes}</p>
      {data.candidates.map((c) => (
        <div key={c._id} style={{ marginBottom: 8 }}>
          <strong>{c.name}</strong> ({c.party}) - {c.voteCount} votes
        </div>
      ))}
    </div>
  );
}

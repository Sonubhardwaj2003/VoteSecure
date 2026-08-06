import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Vote as VoteIcon } from "lucide-react";
import api from "../utils/api";
import Alert from "../components/Alert";
import useMessage from "../hooks/useMessage";

export default function Vote() {
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useMessage();
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState(null);
  const voter = JSON.parse(localStorage.getItem("voter") || "null");

  useEffect(() => {
    if (!voter) return;
    api
      .get(`/candidates?constituency=${encodeURIComponent(voter.constituency)}`)
      .then((res) => setCandidates(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("voter");
          setMessage("Your session has expired. Please log in again.", {
            persist: true,
          });
        } else {
          setMessage("Could not load candidates", { persist: true });
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!voter) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <p className="text-slate-600">
          {localStorage.getItem("adminToken")
            ? "Admin accounts don't have a voter identity to cast a ballot with — this view is for registered voters only."
            : "Please log in first to view and cast your vote."}
        </p>
      </div>
    );
  }

  const handleVote = async (candidateId) => {
    if (!window.confirm("Confirm your vote? This action cannot be undone."))
      return;
    setVotingId(candidateId);
    try {
      const res = await api.post("/vote/cast", { candidateId });
      setMessage(res.data.message, { persist: true });
      setVoted(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Vote failed", {
        persist: true,
      });
    } finally {
      setVotingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="card animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-ink-900">
              Welcome, {voter.fullName}
            </h2>
            <p className="text-sm text-slate-500">
              Constituency: {voter.constituency}
            </p>
          </div>
          <span className="badge-slate">Voter ID: {voter.voterId}</span>
        </div>

        <div className="mt-5">
          {voted || voter.hasVoted ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white py-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <p className="font-semibold text-emerald-800">
                You have already cast your vote. Thank you for participating!
              </p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {candidates.map((c) => (
                <div
                  key={c._id}
                  className="card-hover flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-sm font-bold text-brand-700">
                      {c.name?.[0]?.toUpperCase() || "?"}
                    </span>
                    <div>
                      <p className="font-semibold text-ink-900">{c.name}</p>
                      <p className="text-sm text-slate-500">{c.party}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleVote(c._id)}
                    disabled={votingId === c._id}
                    className="btn-primary"
                  >
                    {votingId === c._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <VoteIcon className="h-4 w-4" />
                    )}
                    {votingId === c._id ? "Casting…" : "Vote"}
                  </button>
                </div>
              ))}
              {candidates.length === 0 && (
                <p className="rounded-lg bg-slate-50 py-6 text-center text-sm text-slate-500">
                  No candidates found for your constituency yet.
                </p>
              )}
            </div>
          )}
        </div>

        {message && (
          <div className="mt-4">
            <Alert message={message} />
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Trophy, Loader2, BarChart3, Search } from "lucide-react";
import api from "../utils/api";
import TextInput from "../components/TextInput";

export default function Results() {
  const [data, setData] = useState({ totalVotes: 0, candidates: [] });
  const [constituency, setConstituency] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = () => {
      api
        .get(`/vote/results${constituency ? `?constituency=${encodeURIComponent(constituency)}` : ""}`)
        .then((res) => setData(res.data))
        .finally(() => setLoading(false));
    };

    fetchResults();
    const interval = setInterval(fetchResults, 5000); // live-ish refresh
    return () => clearInterval(interval);
  }, [constituency]);

  const leaderVotes = data.candidates[0]?.voteCount || 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="card animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink-900">Live Results</h2>
              <p className="text-xs text-slate-500">Auto-refreshes every 5 seconds</p>
            </div>
          </div>
          <span className="badge-slate">Total votes: {data.totalVotes}</span>
        </div>

        <TextInput
          icon={Search}
          placeholder="Filter by constituency"
          value={constituency}
          onChange={(e) => setConstituency(e.target.value)}
          className="mt-4"
        />

        <div className="mt-5 flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
            </div>
          ) : data.candidates.length === 0 ? (
            <p className="rounded-lg bg-slate-50 py-6 text-center text-sm text-slate-500">
              No results to show yet.
            </p>
          ) : (
            data.candidates.map((c, i) => {
              const pct = leaderVotes > 0 ? Math.round((c.voteCount / leaderVotes) * 100) : 0;
              const isLeader = i === 0 && c.voteCount > 0;
              return (
                <div
                  key={c._id}
                  className={`card-hover rounded-xl border p-4 ${
                    isLeader ? "border-amber-200 bg-gradient-to-r from-amber-50/60 to-white" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {isLeader && (
                        <span className="badge-gold">
                          <Trophy className="h-3 w-3" /> Leading
                        </span>
                      )}
                      <p className="font-semibold text-ink-900">
                        {c.name} <span className="font-normal text-slate-500">({c.party} · {c.symbol})</span>
                      </p>
                    </div>
                    <span className="text-sm font-bold text-brand-700">{c.voteCount} votes</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLeader ? "bg-gradient-to-r from-amber-400 to-amber-500" : "bg-brand-600"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

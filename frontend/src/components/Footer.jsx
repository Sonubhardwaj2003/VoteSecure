import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ScanFace, MailCheck } from "lucide-react";

const techStack = ["React", "Node.js", "Express", "MongoDB", "face-api.js", "JWT"];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="text-sm font-extrabold text-ink-900">
                Vote<span className="text-brand-600">Secure</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Bringing verifiable identity to remote voting — a live face check and a
              one-time email code stand between every voter and their ballot.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">Navigate</h4>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
              <li><Link to="/" className="hover:text-brand-600">Voter Login</Link></li>
              <li><Link to="/register" className="hover:text-brand-600">Register to Vote</Link></li>
              <li><Link to="/results" className="hover:text-brand-600">Live Results</Link></li>
              <li><Link to="/admin" className="hover:text-brand-600">Admin</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">How it's secured</h4>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
              <li className="flex items-center gap-1.5">
                <ScanFace className="h-3.5 w-3.5 text-brand-600" /> Live face verification
              </li>
              <li className="flex items-center gap-1.5">
                <MailCheck className="h-3.5 w-3.5 text-brand-600" /> Email OTP two-factor login
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> One verified identity, one vote
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} VoteSecure. Every identity verified, every vote counted.
        </p>
      </div>
    </footer>
  );
}

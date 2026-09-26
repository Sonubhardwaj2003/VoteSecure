import React from "react";
import { ShieldCheck, ScanFace, MailCheck, Vote as VoteIcon } from "lucide-react";

const highlights = [
  { icon: ScanFace, text: "Live face verification with blink-based liveness detection" },
  { icon: MailCheck, text: "Email OTP as a second authentication factor" },
  { icon: VoteIcon, text: "One verified identity, exactly one vote — enforced atomically" },
];

function Brandmark({ light }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          light ? "bg-white/15 backdrop-blur" : "bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm shadow-brand-600/30"
        } text-white`}
      >
        <ShieldCheck className="h-4 w-4" />
      </span>
      <span className={`text-base font-extrabold tracking-tight ${light ? "text-white" : "text-ink-900 dark:text-white"}`}>
        VoteSecure
      </span>
    </div>
  );
}

export default function AuthSplitLayout({ children }) {
  return (
    <div className="flex min-h-[75vh] w-full flex-col md:flex-row">
      {/* Compact promo strip — mobile / small screens only. Keeps the app's
          identity and trust signals visible instead of just disappearing,
          without eating vertical space needed for the form below. */}
      <div className="border-b border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900 sm:px-6 md:hidden">
        <Brandmark />
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Secure, face-verified online voting.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {highlights.map((h) => (
            <span
              key={h.text}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <h.icon className="h-3 w-3 text-brand-600 dark:text-brand-400" />
              {h.text.split(" ").slice(0, 3).join(" ")}
            </span>
          ))}
        </div>
      </div>

      {/* Full promotional panel — desktop / tablet only (md and up) */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-indigo-800 md:flex md:w-[44%] md:flex-col md:justify-between md:p-10 lg:p-14">
        {/* layered decorative background: soft grid + glowing blobs */}
        <div className="absolute inset-0 bg-dot-grid opacity-[0.15] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_75%)]" />
        <div className="blob -left-16 -top-16 h-72 w-72 animate-float bg-brand-400/30" />
        <div className="blob -right-10 bottom-10 h-64 w-64 animate-float bg-indigo-400/25" style={{ animationDelay: "2s" }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        <div className="relative z-10">
          <Brandmark light />
        </div>

        <div className="relative z-10 my-10">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-brand-50 backdrop-blur">
            Two-factor identity verification
          </span>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white lg:text-4xl">
            Secure, face-verified <br className="hidden lg:block" /> online voting.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-brand-100">
            A live face check and a one-time email code stand between every voter and their ballot.
          </p>
        </div>

        <ul className="relative z-10 flex flex-col gap-3">
          {highlights.map((h) => (
            <li
              key={h.text}
              className="flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/5 p-2.5 text-sm text-brand-50 backdrop-blur-sm"
            >
              <h.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-white" />
              <span>{h.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-900 sm:px-6 md:px-10 lg:px-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

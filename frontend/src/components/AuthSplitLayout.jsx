import React from "react";
import { ShieldCheck, ScanFace, MailCheck, Vote as VoteIcon } from "lucide-react";

const highlights = [
  { icon: ScanFace, text: "Live face verification with blink-based liveness detection" },
  { icon: MailCheck, text: "Email OTP as a second authentication factor" },
  { icon: VoteIcon, text: "One verified identity, exactly one vote — enforced atomically" },
];

export default function AuthSplitLayout({ children }) {
  return (
    <div className="flex min-h-[75vh] w-full flex-col md:flex-row">
      {/* Brand panel — hidden on mobile, shown from md: (tablet) upward */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-700 md:flex md:w-[42%] md:flex-col md:justify-between md:p-10 lg:p-14">
        <div className="blob -left-16 -top-16 h-72 w-72 animate-float bg-white/10" />
        <div className="blob -right-10 bottom-10 h-64 w-64 animate-float bg-white/10" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 flex items-center gap-2 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">VoteSecure</span>
        </div>

        <div className="relative z-10 my-10">
          <h2 className="text-3xl font-extrabold leading-tight text-white lg:text-4xl">
            Secure, face-verified <br className="hidden lg:block" /> online voting.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-brand-100">
            Two-factor identity verification stands between every ballot and every voter.
          </p>
        </div>

        <ul className="relative z-10 flex flex-col gap-3">
          {highlights.map((h) => (
            <li key={h.text} className="flex items-start gap-2.5 text-sm text-brand-50">
              <h.icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{h.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Form panel — full width on mobile, remaining ~58% on desktop */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-900 sm:px-6 md:px-10 lg:px-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
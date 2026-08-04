import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { ShieldCheck, Menu, X, LogIn, UserPlus, Vote as VoteIcon, BarChart3, LayoutDashboard } from "lucide-react";

const links = [
  { to: "/", label: "Voter Login", end: true, icon: LogIn },
  { to: "/register", label: "Register", icon: UserPlus },
  { to: "/vote", label: "Cast Vote", icon: VoteIcon },
  { to: "/results", label: "Results", icon: BarChart3 },
  { to: "/admin", label: "Admin", icon: LayoutDashboard },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-brand-50 text-brand-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-ink-900"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-600/30">
            <ShieldCheck className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink-900">
            Vote<span className="text-brand-600">Secure</span>
          </span>
        </NavLink>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="animate-fade-in border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={() => setOpen(false)}>
                <l.icon className="h-4 w-4" />
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

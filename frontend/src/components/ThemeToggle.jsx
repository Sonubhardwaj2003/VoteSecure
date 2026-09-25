import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import useTheme from "../hooks/useTheme";

const options = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => setTheme(o.value)}
          aria-label={o.label}
          title={o.label}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
            theme === o.value
              ? "bg-brand-600 text-white"
              : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          }`}
        >
          <o.icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
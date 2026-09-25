import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "vs-theme"; // "light" | "dark" | "system"

function applyTheme(theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export default function useTheme() {
  const [theme, setThemeState] = useState(() => localStorage.getItem(STORAGE_KEY) || "system");

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyTheme("system");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [theme]);

  const setTheme = useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  return { theme, setTheme };
}
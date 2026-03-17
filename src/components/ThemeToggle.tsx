"use client";

import { useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolved: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", resolved);
}

export function useTheme() {
  const [preference, setPreference] = useState<Theme>("system");

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setPreference(stored);
    }
  }, []);

  // Apply theme and listen for system changes
  useEffect(() => {
    const resolved =
      preference === "system" ? getSystemTheme() : preference;
    applyTheme(resolved);

    if (preference === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) =>
        applyTheme(e.matches ? "dark" : "light");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [preference]);

  const cycle = useCallback(() => {
    setPreference((prev) => {
      const next: Theme =
        prev === "system" ? "light" : prev === "light" ? "dark" : "system";
      localStorage.setItem("theme", next);
      return next;
    });
  }, []);

  return { preference, cycle };
}

export function ThemeToggle() {
  const { preference, cycle } = useTheme();

  const icon =
    preference === "light" ? "☀️" : preference === "dark" ? "🌙" : "💻";
  const label =
    preference === "light"
      ? "Light"
      : preference === "dark"
        ? "Dark"
        : "System";

  return (
    <button
      className="btn btn-outline btn-sm theme-toggle"
      onClick={cycle}
      title={`Theme: ${label}`}
      aria-label={`Theme: ${label}. Click to change.`}
    >
      <span className="theme-icon">{icon}</span>
    </button>
  );
}

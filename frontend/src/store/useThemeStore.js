import { create } from "zustand";

const stored = localStorage.getItem("synq_theme");
const initial = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

export const useThemeStore = create((set) => ({
  theme: initial,

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("synq_theme", next);
      return { theme: next };
    }),

  setTheme: (theme) => {
    localStorage.setItem("synq_theme", theme);
    set({ theme });
  },
}));

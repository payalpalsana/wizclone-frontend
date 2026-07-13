import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { listenToTheme } from "../lib/monday";

const STORAGE_KEY = "wizclone-theme";

const ThemeContext = createContext({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    try {
      listenToTheme((res) => {
        if (localStorage.getItem(STORAGE_KEY)) return;
        const mondayDark =
          res?.data?.theme === "dark" || res?.data?.theme === "black";
        setTheme(mondayDark ? "dark" : "light");
      });
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

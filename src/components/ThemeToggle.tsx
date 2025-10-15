import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        "p-2 rounded-md transition-colors duration-200 cursor-pointer -mr-0.5",
        theme === "dark"
          ? "text-white hover:bg-gray-700"
          : "text-gray-700 hover:bg-gray-200"
      )}
      aria-label="Toggle theme"
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
};

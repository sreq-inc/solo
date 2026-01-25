import clsx from "clsx";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useEnvironment } from "../hooks/useEnvironment";

export const EnvironmentSelector = () => {
  const { theme } = useTheme();
  const { environments, activeEnvironment, setActiveEnvironment } =
    useEnvironment();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectEnvironment = (id: string) => {
    setActiveEnvironment(id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
          theme === "dark"
            ? "bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700"
            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
        )}
        title="Select environment"
      >
        <Globe className="w-4 h-4" />
        <span>{activeEnvironment?.name || "No Environment"}</span>
        <ChevronDown
          className={clsx(
            "w-4 h-4 transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={clsx(
            "absolute top-full left-0 mt-2 w-64 rounded-lg shadow-lg border z-[9999]",
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          )}
        >
          <div
            className={clsx(
              "px-3 py-2 border-b text-xs font-semibold uppercase tracking-wide",
              theme === "dark"
                ? "border-gray-700 text-gray-400"
                : "border-gray-200 text-gray-500"
            )}
          >
            Select Environment
          </div>
          <div className="max-h-80 overflow-y-auto py-1">
            {environments.map((env) => (
              <button
                key={env.id}
                onClick={() => handleSelectEnvironment(env.id)}
                className={clsx(
                  "w-full flex items-center justify-between px-3 py-2 text-sm transition-colors cursor-pointer",
                  theme === "dark"
                    ? "hover:bg-gray-700 text-gray-200"
                    : "hover:bg-gray-100 text-gray-700",
                  env.isActive &&
                    (theme === "dark" ? "bg-gray-700" : "bg-gray-100")
                )}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">{env.name}</span>
                  <span
                    className={clsx(
                      "text-xs px-1.5 py-0.5 rounded",
                      theme === "dark"
                        ? "bg-gray-900 text-gray-400"
                        : "bg-gray-200 text-gray-600"
                    )}
                  >
                    {env.type}
                  </span>
                </div>
                {env.isActive && <Check className="w-4 h-4 text-purple-500" />}
              </button>
            ))}
          </div>
          {environments.length === 0 && (
            <div
              className={clsx(
                "px-3 py-4 text-sm text-center",
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              )}
            >
              No environments available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

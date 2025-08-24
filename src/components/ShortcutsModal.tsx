import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal = ({ isOpen, onClose }: ShortcutsModalProps) => {
  const { theme } = useTheme();
  const shortcuts = useKeyboardShortcuts();

  const formatShortcut = (shortcut: any) => {
    const keys = [];
    if (shortcut.cmd) keys.push("Cmd");
    if (shortcut.alt) keys.push("Alt");
    if (shortcut.shift) keys.push("Shift");
    keys.push(shortcut.key.toUpperCase());
    return keys.join(" + ");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={clsx(
          "relative w-full max-w-md mx-4 rounded-lg shadow-xl border",
          theme === "dark"
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-200"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2
            className={clsx(
              "text-lg font-semibold",
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            )}
          >
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className={clsx(
              "p-1 rounded-lg transition-colors cursor-pointer",
              theme === "dark"
                ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            )}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto p-4">
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className={clsx(
                  "flex items-center justify-between p-3 rounded-lg",
                  theme === "dark" ? "bg-gray-800/30" : "bg-gray-50"
                )}
              >
                <span
                  className={clsx(
                    "text-sm",
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  {shortcut.description}
                </span>
                <kbd
                  className={clsx(
                    "px-2 py-1 text-xs font-mono rounded border",
                    theme === "dark"
                      ? "bg-gray-900 text-purple-400 border-gray-600"
                      : "bg-white text-purple-600 border-gray-300"
                  )}
                >
                  {formatShortcut(shortcut)}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className={clsx(
            "p-4 border-t text-center text-xs",
            theme === "dark"
              ? "border-gray-700 text-gray-500"
              : "border-gray-200 text-gray-600"
          )}
        >
          Press{" "}
          <kbd
            className={clsx(
              "px-1 py-0.5 rounded text-xs font-mono",
              theme === "dark"
                ? "bg-gray-800 text-gray-400"
                : "bg-gray-100 text-gray-600"
            )}
          >
            ESC
          </kbd>{" "}
          to close
        </div>
      </div>
    </div>
  );
};

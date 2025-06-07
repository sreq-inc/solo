import { useState, useRef, useEffect } from "react";
import { useVariables } from "../context/VariablesContext";
import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";

interface SmartUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * SmartUrlInput Component
 *
 * An enhanced input field that provides:
 * - Auto-completion for curly brackets ({{ }})
 * - Visual highlighting of variables with colored backgrounds
 * - Real-time variable validation and preview
 * - Color-coded variable indicators (green for first, purple for others, red for undefined)
 *
 * Uses a contentEditable div to show colored variables instead of overlay approach
 */
export const SmartUrlInput = ({
  value,
  onChange,
  placeholder = "",
  className = "",
}: SmartUrlInputProps) => {
  const { variables, replaceVariablesInUrl } = useVariables();
  const { theme } = useTheme();
  const [showPreview, setShowPreview] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const isLightTheme = theme === "light";

  /**
   * Finds all variables in the format {{variableName}} within the text
   * Returns array with variable info including position, existence, and value
   */
  const findVariables = (text: string) => {
    const matches = [];
    const regex = /\{\{\s*([^}]+)\s*\}\}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const variableName = match[1].trim();
      const existingVariable = variables.find(
        (v) => v.key.trim() === variableName && v.enabled && v.value.trim()
      );

      matches.push({
        variable: variableName,
        exists: !!existingVariable,
        value: existingVariable?.value || "",
        fullMatch: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
    return matches;
  };

  // Core state calculations
  const variableMatches = findVariables(value);
  const hasVariables = variableMatches.length > 0;
  const processedUrl = hasVariables ? replaceVariablesInUrl(value) : value;
  const hasUnresolvedVariables = processedUrl.includes("{{");
  const hasValidProtocol =
    processedUrl.startsWith("http://") || processedUrl.startsWith("https://");
  const needsProtocol =
    processedUrl.trim() && !hasValidProtocol && !hasUnresolvedVariables;

  // Track cursor position
  useEffect(() => {
    const updateCursor = () => {
      if (hiddenInputRef.current) {
        setCursorPosition(hiddenInputRef.current.selectionStart || 0);
      }
    };

    const input = hiddenInputRef.current;
    if (input) {
      input.addEventListener("selectionchange", updateCursor);
      input.addEventListener("keyup", updateCursor);
      input.addEventListener("click", updateCursor);

      return () => {
        input.removeEventListener("selectionchange", updateCursor);
        input.removeEventListener("keyup", updateCursor);
        input.removeEventListener("click", updateCursor);
      };
    }
  }, []);

  /**
   * Renders the content with highlighted variables and cursor
   */
  const renderContent = () => {
    if (!isFocused && hasVariables) {
      // When not focused and has variables, show colored segments
      const segments = [];
      let lastIndex = 0;

      variableMatches.forEach((match, index) => {
        // Add text before variable
        if (match.start > lastIndex) {
          segments.push(
            <span
              key={`text-${lastIndex}`}
              className={
                isLightTheme
                  ? "text-gray-900"
                  : "text-gray-900 dark:text-gray-100"
              }
            >
              {value.substring(lastIndex, match.start)}
            </span>
          );
        }

        // Add colored variable
        segments.push(
          <span
            key={`var-${index}`}
            className={clsx(
              "text-white font-mono font-medium text-xs",
              isLightTheme
                ? "px-2 py-1 rounded-md shadow-sm"
                : "px-1 py-0.5 rounded",
              match.exists
                ? index === 0
                  ? isLightTheme
                    ? "bg-emerald-500"
                    : "bg-green-600"
                  : isLightTheme
                  ? "bg-violet-500"
                  : "bg-purple-600"
                : isLightTheme
                ? "bg-rose-500"
                : "bg-red-600"
            )}
          >
            {match.fullMatch}
          </span>
        );

        lastIndex = match.end;
      });

      // Add remaining text
      if (lastIndex < value.length) {
        segments.push(
          <span
            key={`text-${lastIndex}`}
            className={
              isLightTheme
                ? "text-gray-900"
                : "text-gray-900 dark:text-gray-100"
            }
          >
            {value.substring(lastIndex)}
          </span>
        );
      }

      return segments.length > 0 ? (
        segments
      ) : (
        <span className={isLightTheme ? "text-gray-500" : "text-gray-400"}>
          {placeholder}
        </span>
      );
    }

    // When focused or no variables, show text with cursor
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);

    if (!value) {
      return (
        <span
          className={clsx(
            "relative",
            isLightTheme ? "text-gray-500" : "text-gray-400"
          )}
        >
          {placeholder}
          {isFocused && (
            <span
              className={clsx(
                "absolute left-0 top-0 w-0.5 h-5 animate-pulse",
                isLightTheme ? "bg-blue-500" : "bg-gray-900 dark:bg-gray-100"
              )}
            />
          )}
        </span>
      );
    }

    return (
      <span
        className={clsx(
          "relative inline-block",
          isLightTheme ? "text-gray-900" : "text-gray-900 dark:text-gray-100"
        )}
      >
        <span
          className={
            isLightTheme ? "text-gray-900" : "text-gray-900 dark:text-gray-100"
          }
        >
          {beforeCursor}
        </span>
        {isFocused && (
          <span
            className={clsx(
              "w-0.5 h-5 animate-pulse inline-block relative top-1",
              isLightTheme ? "bg-blue-500" : "bg-gray-900 dark:bg-gray-100"
            )}
          />
        )}
        <span
          className={
            isLightTheme ? "text-gray-900" : "text-gray-900 dark:text-gray-100"
          }
        >
          {afterCursor}
        </span>
      </span>
    );
  };

  /**
   * Handle input changes from the hidden input
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  /**
   * Handle key events for bracket autocompletion
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle bracket autocompletion
    if (e.key === "{") {
      e.preventDefault();
      const input = hiddenInputRef.current;
      if (!input) return;

      const selectionStart = input.selectionStart || 0;
      const beforeCursor = value.substring(0, selectionStart);
      const afterCursor = value.substring(selectionStart);

      let newValue: string;
      let newCursorPosition: number;

      if (beforeCursor.endsWith("{")) {
        // Second {, complete with {{}}
        newValue = beforeCursor + "{}" + afterCursor;
        newCursorPosition = selectionStart + 1;
      } else {
        // First {, complete with {}
        newValue = beforeCursor + "{}" + afterCursor;
        newCursorPosition = selectionStart + 1;
      }

      onChange(newValue);

      setTimeout(() => {
        if (input) {
          input.setSelectionRange(newCursorPosition, newCursorPosition);
          setCursorPosition(newCursorPosition);
        }
      }, 0);
    }
  };

  /**
   * Focus the hidden input when the visible div is clicked
   */
  const handleDivClick = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  return (
    <div className="relative w-full">
      {/* Hidden input for actual text editing */}
      <input
        ref={hiddenInputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setIsFocused(true);
          setShowPreview(true);
        }}
        onBlur={() => {
          setIsFocused(false);
          setTimeout(() => setShowPreview(false), 200);
        }}
        onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart || 0)}
        className={clsx(
          "absolute inset-0 pointer-events-auto z-10 caret-transparent ring-0 focus:ring-0 focus:outline-none",
          isLightTheme
            ? "opacity-0 text-transparent"
            : "opacity-0 text-white dark:text-white"
        )}
      />

      {/* Visible content with colored variables */}
      <div
        onClick={handleDivClick}
        className={clsx(
          className,
          "cursor-text relative z-5 flex items-center px-3 py-2.5",
          isLightTheme
            ? "min-h-[40px] bg-white border border-gray-300 hover:border-gray-400 transition-colors"
            : "min-h-[40px]"
        )}
      >
        {renderContent()}
      </div>

      {/* Variable status indicators */}
      {hasVariables && (
        <div
          className={clsx(
            "absolute top-1/2 transform -translate-y-1/2 flex z-20",
            isLightTheme ? "right-3 gap-1.5" : "right-2 gap-1"
          )}
        >
          {variableMatches.map((match, index) => (
            <div
              key={index}
              className={clsx(
                "rounded-full",
                isLightTheme
                  ? "w-2.5 h-2.5 border border-white shadow-sm"
                  : "w-2 h-2",
                match.exists
                  ? index === 0
                    ? isLightTheme
                      ? "bg-emerald-500"
                      : "bg-green-500"
                    : isLightTheme
                    ? "bg-violet-500"
                    : "bg-purple-500"
                  : isLightTheme
                  ? "bg-rose-500"
                  : "bg-red-500"
              )}
              title={
                match.exists
                  ? `${match.variable}: ${match.value}`
                  : `${match.variable} not found`
              }
            />
          ))}
        </div>
      )}

      {/* Variable preview tooltip */}
      {showPreview && hasVariables && (
        <div
          className={clsx(
            "absolute top-full left-0 right-0 mt-1 rounded-md border shadow-lg z-50",
            isLightTheme
              ? "mt-2 p-4 rounded-lg shadow-xl bg-white border-gray-200 text-gray-900"
              : "p-3 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          )}
        >
          <div className={isLightTheme ? "mb-4" : "mb-3"}>
            <div className={clsx("font-semibold mb-2 opacity-70 text-xs")}>
              Variables found:
            </div>
            <div className={isLightTheme ? "space-y-2" : "space-y-1"}>
              {variableMatches.map((match, index) => (
                <div
                  key={index}
                  className={clsx("flex items-center gap-2 text-xs")}
                >
                  <div
                    className={clsx(
                      "rounded-full flex-shrink-0",
                      isLightTheme
                        ? "w-2.5 h-2.5 border border-white shadow-sm"
                        : "w-2 h-2",
                      match.exists
                        ? index === 0
                          ? isLightTheme
                            ? "bg-emerald-500"
                            : "bg-green-500"
                          : isLightTheme
                          ? "bg-violet-500"
                          : "bg-purple-500"
                        : isLightTheme
                        ? "bg-rose-500"
                        : "bg-red-500"
                    )}
                  />
                  <span
                    className={clsx(
                      "font-mono text-white font-medium text-xs",
                      isLightTheme
                        ? "px-2 py-1 rounded-md"
                        : "px-1 py-0.5 rounded",
                      match.exists
                        ? index === 0
                          ? isLightTheme
                            ? "bg-emerald-600"
                            : "bg-green-700"
                          : isLightTheme
                          ? "bg-violet-600"
                          : "bg-purple-600"
                        : isLightTheme
                        ? "bg-rose-600"
                        : "bg-red-600"
                    )}
                  >
                    {"{{"}
                    {match.variable}
                    {"}}"}
                  </span>
                  {match.exists ? (
                    <>
                      <span
                        className={
                          isLightTheme ? "text-gray-400" : "opacity-50"
                        }
                      >
                        →
                      </span>
                      <span
                        className={clsx(
                          "font-mono",
                          isLightTheme
                            ? "text-blue-600 bg-blue-50 px-2 py-1 rounded"
                            : "text-blue-600 dark:text-blue-400"
                        )}
                      >
                        {match.value}
                      </span>
                    </>
                  ) : (
                    <span
                      className={clsx(
                        isLightTheme
                          ? "text-rose-600 font-medium"
                          : "text-red-600 dark:text-red-400 text-xs"
                      )}
                    >
                      (not defined)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className={clsx("font-semibold mb-1 opacity-70 text-xs")}>
              Final URL:
            </div>
            <div
              className={clsx(
                "font-mono p-2 rounded border text-xs",
                isLightTheme
                  ? clsx(
                      "p-3 rounded-lg bg-gray-50 border-gray-200",
                      hasUnresolvedVariables &&
                        "text-rose-600 bg-rose-50 border-rose-200"
                    )
                  : clsx(
                      "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                      hasUnresolvedVariables && "text-red-500"
                    )
              )}
            >
              {processedUrl}
            </div>
          </div>

          {hasUnresolvedVariables && (
            <div
              className={clsx(
                "mt-2 p-2 rounded text-xs",
                isLightTheme
                  ? "mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800"
                  : "bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200"
              )}
            >
              {isLightTheme ? (
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">⚠️</span>
                  <span className="font-medium">
                    Some variables are not defined
                  </span>
                </div>
              ) : (
                "⚠️ Some variables are not defined"
              )}
            </div>
          )}
          {needsProtocol && (
            <div
              className={clsx(
                "mt-2 p-2 rounded text-xs",
                isLightTheme
                  ? "mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800"
                  : "bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-200"
              )}
            >
              {isLightTheme ? (
                <div className="flex items-center gap-2">
                  <span className="text-rose-500">❌</span>
                  <span className="font-medium">
                    URL must start with http:// or https://
                  </span>
                </div>
              ) : (
                "❌ URL must start with http:// or https://"
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

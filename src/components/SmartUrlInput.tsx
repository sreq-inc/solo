import { useState, useRef, useEffect } from "react";
import { useVariables } from "../context/VariablesContext";
import { useTheme } from "../context/ThemeContext";
import { useBracketAutocompletion } from "../hooks/useBracketAutocompletion";
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
  const editableRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

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

  /**
   * Renders the content with highlighted variables
   */
  const renderContent = () => {
    if (isFocused || !hasVariables) {
      // When focused or no variables, show plain text
      return value || placeholder;
    }

    // When not focused and has variables, show colored segments
    const segments = [];
    let lastIndex = 0;

    variableMatches.forEach((match, index) => {
      // Add text before variable
      if (match.start > lastIndex) {
        segments.push(
          <span key={`text-${lastIndex}`}>
            {value.substring(lastIndex, match.start)}
          </span>
        );
      }

      // Add colored variable
      const backgroundColor = match.exists
        ? index === 0
          ? "#15803d"
          : "#9333ea" // green for first, purple for others
        : "#dc2626"; // red for undefined

      segments.push(
        <span
          key={`var-${index}`}
          style={{
            backgroundColor,
            color: "white",
            padding: "2px 4px",
            borderRadius: "4px",
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
            fontSize: "12px",
            fontWeight: "500",
          }}
        >
          {match.fullMatch}
        </span>
      );

      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < value.length) {
      segments.push(
        <span key={`text-${lastIndex}`}>{value.substring(lastIndex)}</span>
      );
    }

    return segments.length > 0 ? segments : value || placeholder;
  };

  /**
   * Handle input changes from the hidden input
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
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
        className="absolute inset-0 opacity-0 pointer-events-auto z-10"
        style={{ caretColor: "transparent" }}
      />

      {/* Visible content with colored variables */}
      <div
        onClick={handleDivClick}
        className={clsx(
          className,
          "cursor-text relative z-5",
          !value && !isFocused && "text-gray-400"
        )}
        style={{
          minHeight: "40px",
          display: "flex",
          alignItems: "center",
          padding: "8px",
        }}
      >
        {renderContent()}
      </div>

      {/* Variable status indicators */}
      {hasVariables && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1 z-20">
          {variableMatches.map((match, index) => (
            <div
              key={index}
              className={clsx(
                "w-2 h-2 rounded-full",
                match.exists
                  ? index === 0
                    ? "bg-green-500"
                    : "bg-purple-500"
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
            "absolute top-full left-0 right-0 mt-1 p-3 rounded border shadow-lg z-50",
            theme === "dark"
              ? "bg-gray-800 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          )}
        >
          <div className="mb-3">
            <div className="text-xs font-semibold mb-2 opacity-70">
              Variables found:
            </div>
            <div className="space-y-1">
              {variableMatches.map((match, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div
                    className={clsx(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      match.exists
                        ? index === 0
                          ? "bg-green-500"
                          : "bg-purple-500"
                        : "bg-red-500"
                    )}
                  />
                  <span
                    className={clsx(
                      "font-mono px-1 py-0.5 rounded",
                      match.exists
                        ? index === 0
                          ? "bg-green-700 text-white"
                          : "bg-purple-600 text-white"
                        : "bg-red-600 text-white"
                    )}
                  >
                    {"{{"}
                    {match.variable}
                    {"}}"}
                  </span>
                  {match.exists ? (
                    <>
                      <span className="opacity-50">→</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400">
                        {match.value}
                      </span>
                    </>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 text-xs">
                      (not defined)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold mb-1 opacity-70">
              Final URL:
            </div>
            <div
              className={clsx(
                "font-mono text-xs p-2 rounded border",
                theme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-gray-50 border-gray-200",
                hasUnresolvedVariables && "text-red-500"
              )}
            >
              {processedUrl}
            </div>
          </div>

          {hasUnresolvedVariables && (
            <div className="mt-2 p-2 rounded text-xs bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200">
              ⚠️ Some variables are not defined
            </div>
          )}
          {needsProtocol && (
            <div className="mt-2 p-2 rounded text-xs bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-200">
              ❌ URL must start with http:// or https://
            </div>
          )}
        </div>
      )}
    </div>
  );
};

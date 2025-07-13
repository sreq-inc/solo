import React, { useState, useRef } from "react";
import { clsx } from "clsx";
import { useTheme } from "../context/ThemeContext";
import { useVariables } from "../context/VariablesContext";

// Interface for variable match results when parsing URL
interface VariableMatch {
  variable: string;      // The variable name found
  exists: boolean;       // Whether the variable exists in our collection
  value: string;         // The resolved value
  fullMatch: string;     // The complete match string (e.g., "{{baseUrl}}")
  start: number;         // Start position in the string
  end: number;           // End position in the string
}

// Props interface for the SmartUrlInput component
interface SmartUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SmartUrlInput: React.FC<SmartUrlInputProps> = ({
  value,
  onChange,
  placeholder = "",
  className = ""
}) => {
  const { theme } = useTheme();
  const { variables, replaceVariablesInUrl } = useVariables();
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse the input text to find all variable references
  const findVariables = (text: string): VariableMatch[] => {
    const matches: VariableMatch[] = [];
    // Regex to match {{variableName}} patterns
    const regex = /\{\{\s*([^}]+)\s*\}\}/g;
    let match: RegExpExecArray | null;

    // Find all matches in the text
    while ((match = regex.exec(text)) !== null) {
      const variableName = match[1].trim();

      // Check if this variable exists in our collection
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

  // Analyze current input value
  const variableMatches = findVariables(value);
  const hasVariables = variableMatches.length > 0;
  const processedUrl = hasVariables ? replaceVariablesInUrl(value) : value;
  const hasUnresolvedVariables = processedUrl.includes("{{");

  // Handle keyboard shortcuts for easier variable input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    // Auto-complete braces when user types '{'
    if (e.key === "{") {
      e.preventDefault();
      const input = inputRef.current;
      if (!input) return;

      const selectionStart = input.selectionStart || 0;
      const beforeCursor = value.substring(0, selectionStart);
      const afterCursor = value.substring(selectionStart);

      let newValue: string;
      let newCursorPosition: number;

      // If previous character is also '{', complete the variable syntax
      if (beforeCursor.endsWith("{")) {
        newValue = beforeCursor + "{}" + afterCursor;
        newCursorPosition = selectionStart + 1; // Position cursor between braces
      } else {
        newValue = beforeCursor + "{}" + afterCursor;
        newCursorPosition = selectionStart + 1;
      }

      onChange(newValue);

      // Set cursor position after state update
      setTimeout(() => {
        if (input) {
          input.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    }
  };

  // Show preview when input gains focus
  const handleFocus = (): void => {
    setShowPreview(true);
  };

  // Hide preview when input loses focus (with small delay to allow clicking on preview)
  const handleBlur = (): void => {
    setTimeout(() => setShowPreview(false), 200);
  };

  // Handle input value changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(e.target.value);
  };

  // Get color for variable indicator dots based on variable state
  const getVariableIndicatorColor = (match: VariableMatch, index: number): string => {
    return clsx({
      "bg-red-500": !match.exists, // Red for undefined variables
      "bg-green-500": match.exists && index === 0, // Green for first existing variable
      "bg-purple-500": match.exists && index > 0 // Purple for all existing variables after the first
    });
  };

  // Get color for variable preview boxes
  const getVariablePreviewColor = (match: VariableMatch, index: number): string => {
    return clsx({
      "bg-red-500 text-white": !match.exists,
      "bg-green-600 text-white": match.exists && index === 0,
      "bg-purple-600 text-white": match.exists && index > 0 // Purple for all existing variables after the first
    });
  };

  return (
    <div className="relative w-full">
      {/* Main input field */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
      />

      {/* Variable indicator dots - shown when variables are detected */}
      {hasVariables && (
        <div className="absolute top-1/2 transform -translate-y-1/2 right-3 flex gap-1">
          {variableMatches.map((match, index) => (
            <div
              key={`${match.variable}-${index}`}
              className={clsx(
                "w-2 h-2 rounded-full",
                getVariableIndicatorColor(match, index)
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

      {/* Variable preview panel - shown on focus when variables exist */}
      {showPreview && hasVariables && (
        <div className={clsx(
          "absolute top-full left-0 right-0 mt-1 p-3 rounded-md shadow-lg z-50 border",
          {
            "bg-gray-800 border-gray-600 text-white": theme === "dark",
            "bg-white border-gray-300 text-gray-900": theme === "light"
          }
        )}>

          {/* Variables found section */}
          <div className="mb-3">
            <div className={clsx(
              "font-semibold mb-2 text-xs",
              {
                "text-gray-300": theme === "dark",
                "text-gray-600": theme === "light"
              }
            )}>
              Variables found:
            </div>
            <div className="space-y-1">
              {variableMatches.map((match, index) => (
                <div key={`${match.variable}-preview-${index}`} className="flex items-center gap-2 text-xs">
                  {/* Color indicator dot */}
                  <div className={clsx(
                    "w-2 h-2 rounded-full",
                    getVariableIndicatorColor(match, index)
                  )} />

                  {/* Variable name in original syntax */}
                  <span className={clsx(
                    "font-mono px-2 py-1 rounded",
                    getVariablePreviewColor(match, index)
                  )}>
                    {match.fullMatch}
                  </span>

                  {/* Arrow and resolved value (if variable exists) */}
                  {match.exists ? (
                    <>
                      <span className={clsx({
                        "text-gray-400": theme === "dark",
                        "text-gray-500": theme === "light"
                      })}>→</span>
                      <span className={clsx(
                        "font-mono px-2 py-1 rounded",
                        {
                          "text-blue-300 bg-blue-900": theme === "dark",
                          "text-blue-600 bg-blue-50": theme === "light"
                        }
                      )}>
                        {match.value}
                      </span>
                    </>
                  ) : (
                    <span className={clsx(
                      "font-medium",
                      {
                        "text-red-400": theme === "dark",
                        "text-red-600": theme === "light"
                      }
                    )}>
                      (not defined)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Final URL preview section */}
          <div>
            <div className={clsx(
              "font-semibold mb-1 text-xs",
              {
                "text-gray-300": theme === "dark",
                "text-gray-600": theme === "light"
              }
            )}>
              Final URL:
            </div>
            <div className={clsx(
              "font-mono p-2 rounded border text-xs",
              {
                // Unresolved variables styling
                "text-red-400 bg-red-900 border-red-600": hasUnresolvedVariables && theme === "dark",
                "text-red-600 bg-red-50 border-red-200": hasUnresolvedVariables && theme === "light",
                // Normal styling
                "bg-gray-700 border-gray-600 text-gray-200": !hasUnresolvedVariables && theme === "dark",
                "bg-gray-50 border-gray-200 text-gray-800": !hasUnresolvedVariables && theme === "light"
              }
            )}>
              {processedUrl}
            </div>
          </div>

          {/* Warning for unresolved variables */}
          {hasUnresolvedVariables && (
            <div className={clsx(
              "mt-2 p-2 rounded text-xs border",
              {
                "bg-yellow-900 border-yellow-600 text-yellow-300": theme === "dark",
                "bg-yellow-50 border-yellow-200 text-yellow-800": theme === "light"
              }
            )}>
              ⚠️ Some variables are not defined
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import { useState } from "react";
import { useVariables } from "../context/VariablesContext";
import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";

interface SmartUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SmartUrlInput = ({
  value,
  onChange,
  placeholder = "",
  className = "",
}: SmartUrlInputProps) => {
  const { variables, replaceVariablesInUrl } = useVariables();
  const { theme } = useTheme();
  const [showPreview, setShowPreview] = useState(false);

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
      });
    }

    return matches;
  };

  const variableMatches = findVariables(value);
  const hasVariables = variableMatches.length > 0;
  const processedUrl = hasVariables ? replaceVariablesInUrl(value) : value;
  const hasUnresolvedVariables = processedUrl.includes("{{");
  const hasValidProtocol =
    processedUrl.startsWith("http://") || processedUrl.startsWith("https://");
  const needsProtocol =
    processedUrl.trim() && !hasValidProtocol && !hasUnresolvedVariables;

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowPreview(true)}
        onBlur={() => setTimeout(() => setShowPreview(false), 200)}
        placeholder={placeholder}
        className={className}
      />

      {hasVariables && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          {variableMatches.map((match, index) => (
            <div
              key={index}
              className={clsx(
                "w-2 h-2 rounded-full",
                match.exists ? "bg-green-500" : "bg-red-500"
              )}
              title={
                match.exists
                  ? `${match.variable}: ${match.value}`
                  : `${match.variable} não encontrada`
              }
            />
          ))}
        </div>
      )}

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
              Variáveis encontradas:
            </div>
            <div className="space-y-1">
              {variableMatches.map((match, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div
                    className={clsx(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      match.exists ? "bg-green-500" : "bg-red-500"
                    )}
                  />
                  <span className="font-mono">
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
                      (não definida)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold mb-1 opacity-70">
              URL final:
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
              ⚠️ Algumas variáveis não estão definidas
            </div>
          )}

          {needsProtocol && (
            <div className="mt-2 p-2 rounded text-xs bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-200">
              ❌ URL deve começar com http:// ou https://
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import clsx from "clsx";

interface MetadataEntry {
  key: string;
  value: string;
  enabled: boolean;
}

interface MetadataTabProps {
  metadata: string; // JSON string
  onMetadataChange: (metadata: string) => void;
}

export const MetadataTab = ({
  metadata,
  onMetadataChange,
}: MetadataTabProps) => {
  const { theme } = useTheme();
  const [entries, setEntries] = useState<MetadataEntry[]>([
    { key: "", value: "", enabled: true },
  ]);
  const [jsonError, setJsonError] = useState<string>("");

  // Parse metadata JSON into entries on mount and when metadata changes externally
  useEffect(() => {
    try {
      if (metadata && metadata.trim() !== "" && metadata.trim() !== "{}") {
        const parsed = JSON.parse(metadata);
        const newEntries: MetadataEntry[] = Object.entries(parsed).map(
          ([key, value]) => ({
            key,
            value: String(value),
            enabled: true,
          })
        );
        if (newEntries.length > 0) {
          setEntries([...newEntries, { key: "", value: "", enabled: true }]);
        }
      }
    } catch (error) {
      console.error("Failed to parse metadata:", error);
    }
  }, []);

  // Convert entries to JSON and notify parent
  useEffect(() => {
    try {
      const metadataObj: Record<string, string> = {};
      entries.forEach((entry) => {
        if (entry.key && entry.enabled) {
          // Validate lowercase keys
          if (entry.key !== entry.key.toLowerCase()) {
            setJsonError(
              `Metadata key "${entry.key}" must be lowercase (use "${entry.key.toLowerCase()}")`
            );
            return;
          }
          metadataObj[entry.key] = entry.value;
        }
      });
      setJsonError("");
      onMetadataChange(JSON.stringify(metadataObj));
    } catch (error) {
      setJsonError("Failed to build metadata");
    }
  }, [entries, onMetadataChange]);

  const handleAddEntry = () => {
    setEntries([...entries, { key: "", value: "", enabled: true }]);
  };

  const handleRemoveEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleUpdateEntry = (
    index: number,
    field: keyof MetadataEntry,
    value: string | boolean
  ) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3
          className={clsx(
            "text-sm font-medium",
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          )}
        >
          Custom Metadata Headers
        </h3>
        <button
          onClick={handleAddEntry}
          title="Add a new custom metadata header"
          className={clsx(
            "px-3 py-1 text-xs rounded font-medium transition-colors",
            theme === "dark"
              ? "bg-purple-700 hover:bg-purple-800 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          )}
        >
          + Add Header
        </button>
      </div>

      {jsonError && (
        <div
          className={clsx(
            "text-xs p-2 rounded border",
            theme === "dark"
              ? "bg-yellow-900/20 border-yellow-700 text-yellow-300"
              : "bg-yellow-50 border-yellow-300 text-yellow-700"
          )}
        >
          ⚠️ {jsonError}
        </div>
      )}

      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={entry.enabled}
              onChange={(e) =>
                handleUpdateEntry(index, "enabled", e.target.checked)
              }
              title="Enable or disable this header"
              className={clsx(
                "w-4 h-4",
                theme === "dark" ? "accent-purple-500" : "accent-purple-600"
              )}
            />
            <input
              type="text"
              value={entry.key}
              onChange={(e) =>
                handleUpdateEntry(index, "key", e.target.value.toLowerCase())
              }
              placeholder="header-key"
              className={clsx(
                "flex-1 p-2 border rounded text-sm font-mono",
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
              )}
            />
            <input
              type="text"
              value={entry.value}
              onChange={(e) =>
                handleUpdateEntry(index, "value", e.target.value)
              }
              placeholder="header-value"
              className={clsx(
                "flex-1 p-2 border rounded text-sm font-mono",
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
              )}
            />
            <button
              onClick={() => handleRemoveEntry(index)}
              disabled={entries.length === 1}
              className={clsx(
                "p-2 rounded text-sm transition-colors",
                entries.length === 1
                  ? "opacity-50 cursor-not-allowed"
                  : theme === "dark"
                    ? "bg-red-700 hover:bg-red-800 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div
        className={clsx(
          "text-xs p-3 rounded border",
          theme === "dark"
            ? "bg-blue-900/20 border-blue-700 text-blue-300"
            : "bg-blue-50 border-blue-300 text-blue-700"
        )}
      >
        <p className="font-medium mb-1">💡 Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Header keys must be lowercase (e.g., "x-custom-header")</li>
          <li>Use checkboxes to temporarily disable headers</li>
          <li>Common headers: x-request-id, x-trace-id, x-api-version</li>
        </ul>
      </div>
    </div>
  );
};

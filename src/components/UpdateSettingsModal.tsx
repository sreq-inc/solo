import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  useUpdateSettings,
  UpdatePreference,
} from "../hooks/useUpdateSettings";
import { X, Settings } from "lucide-react";
import clsx from "clsx";

interface UpdateSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateSettingsModal = ({
  isOpen,
  onClose,
}: UpdateSettingsModalProps) => {
  const { theme } = useTheme();
  const { settings, saveSettings, clearDismissedUpdates } = useUpdateSettings();
  const [tempSettings, setTempSettings] = useState(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    saveSettings(tempSettings);
    onClose();
  };

  const handlePreferenceChange = (preference: UpdatePreference) => {
    setTempSettings({ ...tempSettings, preference });
  };

  const handleIntervalChange = (interval: number) => {
    setTempSettings({ ...tempSettings, checkInterval: interval });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={clsx(
          "p-6 rounded-lg shadow-lg max-w-md w-full mx-4",
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        )}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h3 className="text-lg font-medium">Update Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-opacity-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">
              How do you want to be notified about updates?
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="preference"
                  checked={tempSettings.preference === "notify"}
                  onChange={() => handlePreferenceChange("notify")}
                  className="text-purple-600"
                />
                <div>
                  <div className="text-sm font-medium">
                    Notify (Recommended)
                  </div>
                  <div className="text-xs text-gray-500">
                    Shows a notification when updates are available
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="preference"
                  checked={tempSettings.preference === "auto"}
                  onChange={() => handlePreferenceChange("auto")}
                  className="text-purple-600"
                />
                <div>
                  <div className="text-sm font-medium">Automatic</div>
                  <div className="text-xs text-gray-500">
                    Downloads and installs updates automatically
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="preference"
                  checked={tempSettings.preference === "manual"}
                  onChange={() => handlePreferenceChange("manual")}
                  className="text-purple-600"
                />
                <div>
                  <div className="text-sm font-medium">Manual</div>
                  <div className="text-xs text-gray-500">
                    Never checks for updates automatically
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Check interval */}
          {tempSettings.preference !== "manual" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Check for updates every:
              </label>
              <select
                value={tempSettings.checkInterval}
                onChange={(e) => handleIntervalChange(Number(e.target.value))}
                className={clsx(
                  "w-full p-2 border rounded text-sm",
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                )}
              >
                <option value={1}>1 hour</option>
                <option value={6}>6 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
                <option value={72}>3 days</option>
                <option value={168}>1 week</option>
              </select>
            </div>
          )}

          {/* Prerelease versions */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={tempSettings.allowPrerelease}
                onChange={(e) =>
                  setTempSettings({
                    ...tempSettings,
                    allowPrerelease: e.target.checked,
                  })
                }
                className="text-purple-600"
              />
              <div>
                <div className="text-sm font-medium">Prerelease versions</div>
                <div className="text-xs text-gray-500">
                  Include beta versions and release candidates
                </div>
              </div>
            </label>
          </div>

          {/* Clear dismissed notifications */}
          <div>
            <button
              onClick={clearDismissedUpdates}
              className={clsx(
                "text-sm px-3 py-1 rounded border",
                theme === "dark"
                  ? "border-gray-600 text-gray-400 hover:border-gray-500"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              )}
            >
              Clear dismissed notifications
            </button>
            <div className="text-xs text-gray-500 mt-1">
              Shows again updates that were dismissed
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6 pt-4 border-t border-gray-300 dark:border-gray-600">
          <button
            onClick={onClose}
            className={clsx(
              "px-4 py-2 rounded text-sm cursor-pointer",
              theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={clsx(
              "px-4 py-2 rounded text-sm text-white flex-1 cursor-pointer",
              theme === "dark"
                ? "bg-purple-700 hover:bg-purple-800"
                : "bg-purple-600 hover:bg-purple-700"
            )}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

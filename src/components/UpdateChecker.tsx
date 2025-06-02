import { useEffect, useState } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { useTheme } from "../context/ThemeContext";
import { useUpdateSettings } from "../hooks/useUpdateSettings";
import { UpdateSettingsModal } from "./UpdateSettingsModal";
import clsx from "clsx";
import { Settings } from "lucide-react";

type UpdateState =
  | "checking"
  | "available"
  | "downloading"
  | "ready"
  | "installing"
  | "none"
  | "error";

type UpdateState =
  | "checking"
  | "available"
  | "downloading"
  | "ready"
  | "installing"
  | "none"
  | "error";

export const UpdateChecker = () => {
  const { theme } = useTheme();
  const {
    settings,
    shouldCheckForUpdates,
    markUpdateCheckTime,
    isUpdateDismissed,
    dismissUpdate,
  } = useUpdateSettings();

  const [updateState, setUpdateState] = useState<UpdateState>("none");
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changelogExpanded, setChangelogExpanded] = useState(false);

  useEffect(() => {
    // Check for updates based on user settings
    if (shouldCheckForUpdates()) {
      checkForUpdates();
    }

    // Set up periodic checking if not manual
    if (settings.preference !== "manual") {
      const interval = setInterval(() => {
        if (shouldCheckForUpdates()) {
          checkForUpdates();
        }
      }, settings.checkInterval * 60 * 60 * 1000); // convert hours to ms

      return () => clearInterval(interval);
    }
  }, [settings]);

  const checkForUpdates = async () => {
    setUpdateState("checking");
    try {
      const update = await check();
      markUpdateCheckTime();

      if (update?.available) {
        setUpdateInfo(update);

        // Check if this version was already dismissed by user
        if (!isUpdateDismissed(update.version)) {
          setUpdateState("available");
          setShowNotification(true);

          // If auto mode, download automatically
          if (settings.preference === "auto") {
            await downloadUpdate(update);
          }
        } else {
          setUpdateState("none");
        }
      } else {
        setUpdateState("none");
      }
    } catch (err: any) {
      setError(err.message || "Error checking for updates");
      setUpdateState("error");
    }
  };

  const downloadUpdate = async (update = updateInfo) => {
    if (!update) return;

    setUpdateState("downloading");
    try {
      await update.download();
      setUpdateState("ready");

      // If auto mode, install automatically
      if (settings.preference === "auto") {
        await installUpdate(update);
      }
    } catch (err: any) {
      setError(err.message || "Error downloading update");
      setUpdateState("error");
    }
  };

  const installUpdate = async (update = updateInfo) => {
    if (!update) return;

    setUpdateState("installing");
    try {
      await update.install();
    } catch (err: any) {
      setError(err.message || "Error installing update");
      setUpdateState("error");
    }
  };

  const dismissNotification = () => {
    if (updateInfo) {
      dismissUpdate(updateInfo.version);
    }
    setShowNotification(false);
  };

  const getStateMessage = () => {
    switch (updateState) {
      case "checking":
        return "Checking for updates...";
      case "downloading":
        return "Downloading update...";
      case "ready":
        return "Update downloaded and ready to install";
      case "installing":
        return "Installing update...";
      case "error":
        return `Error: ${error}`;
      default:
        return "";
    }
  };

  // Don't show notification if manual preference or already dismissed
  if (
    !showNotification ||
    updateState === "none" ||
    settings.preference === "manual"
  ) {
    return (
      <>
        {/* Small buttons for manual check or settings */}
        <div className="fixed bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className={clsx(
              "p-2 rounded-full shadow-lg opacity-70 hover:opacity-100 transition-opacity",
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-800"
            )}
            title="Update settings"
          >
            ⚙️
          </button>

          {settings.preference === "manual" && (
            <button
              onClick={checkForUpdates}
              disabled={updateState === "checking"}
              className={clsx(
                "p-2 rounded-full shadow-lg opacity-70 hover:opacity-100 transition-opacity",
                theme === "dark"
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-800",
                updateState === "checking" && "animate-pulse"
              )}
              title="Check for updates"
            >
              🔄
            </button>
          )}
        </div>

        <UpdateSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </>
    );
  }

  return (
    <>
      <div
        className={clsx(
          "fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-sm z-50 border",
          theme === "dark"
            ? "bg-gray-800 border-gray-700 text-white"
            : "bg-white border-gray-300 text-gray-900"
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={clsx(
              "w-3 h-3 rounded-full flex-shrink-0 mt-1",
              updateState === "available" && "bg-blue-500",
              updateState === "downloading" && "bg-yellow-500 animate-pulse",
              updateState === "ready" && "bg-green-500",
              updateState === "installing" && "bg-blue-500 animate-pulse",
              updateState === "error" && "bg-red-500"
            )}
          />

          <div className="flex-1">
            <h3 className="font-medium text-sm mb-1">
              {updateState === "available" && "New version available"}
              {updateState === "ready" && "Ready to install"}
              {updateState === "error" && "Update error"}
              {(updateState === "downloading" ||
                updateState === "installing") &&
                "Updating..."}
            </h3>

            <p
              className={clsx(
                "text-xs",
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              )}
            >
              {updateState === "available" && (
                <>
                  Version {updateInfo?.version} is available.
                  {updateInfo?.notes && (
                    <button
                      onClick={() => setChangelogExpanded(!changelogExpanded)}
                      className="ml-1 underline hover:no-underline"
                    >
                      {changelogExpanded ? "Hide" : "View"} changelog
                    </button>
                  )}
                </>
              )}
              {(updateState === "downloading" ||
                updateState === "installing" ||
                updateState === "ready") &&
                getStateMessage()}
              {updateState === "error" && error}
            </p>

            {changelogExpanded && updateInfo?.notes && (
              <div
                className={clsx(
                  "mt-2 p-2 rounded text-xs max-h-32 overflow-y-auto",
                  theme === "dark" ? "bg-gray-900" : "bg-gray-100"
                )}
              >
                <pre className="whitespace-pre-wrap font-mono">
                  {updateInfo.notes}
                </pre>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => setShowSettings(true)}
              className={clsx(
                "text-xs hover:opacity-70 flex-shrink-0",
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              )}
              title="Settings"
            >
              ⚙️
            </button>
            <button
              onClick={dismissNotification}
              className={clsx(
                "text-xs hover:opacity-70 flex-shrink-0",
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              )}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          {updateState === "available" && (
            <>
              <button
                onClick={() => downloadUpdate()}
                className={clsx(
                  "px-3 py-1 text-xs rounded font-medium flex-1",
                  theme === "dark"
                    ? "bg-blue-700 hover:bg-blue-800 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                Download
              </button>
              <button
                onClick={dismissNotification}
                className={clsx(
                  "px-3 py-1 text-xs rounded",
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                )}
              >
                Not now
              </button>
            </>
          )}

          {updateState === "ready" && (
            <>
              <button
                onClick={() => installUpdate()}
                className={clsx(
                  "px-3 py-1 text-xs rounded font-medium flex-1",
                  theme === "dark"
                    ? "bg-green-700 hover:bg-green-800 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                )}
              >
                Install & Restart
              </button>
              <button
                onClick={dismissNotification}
                className={clsx(
                  "px-3 py-1 text-xs rounded",
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                )}
              >
                Later
              </button>
            </>
          )}

          {updateState === "error" && (
            <button
              onClick={checkForUpdates}
              className={clsx(
                "px-3 py-1 text-xs rounded font-medium",
                theme === "dark"
                  ? "bg-red-700 hover:bg-red-800 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              Try again
            </button>
          )}
        </div>
      </div>

      <UpdateSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

import { useEffect, useState } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { useTheme } from "../context/ThemeContext";
import { useUpdateSettings } from "../hooks/useUpdateSettings";
import { UpdateSettingsModal } from "./UpdateSettingsModal";
import clsx from "clsx";
import { Settings, Download, X, RefreshCw } from "lucide-react";

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
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (shouldCheckForUpdates()) {
      checkForUpdates();
    }
    if (settings.preference !== "manual") {
      const interval = setInterval(() => {
        if (shouldCheckForUpdates()) {
          checkForUpdates();
        }
      }, settings.checkInterval * 60 * 60 * 1000);
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
        if (!isUpdateDismissed(update.version)) {
          setUpdateState("available");
          setShowTooltip(true);
        } else {
          setUpdateState("none");
        }
      } else {
        setUpdateState("none");
      }
    } catch (err: any) {
      console.error("Error checking for updates:", err);
      setError(err.message || "Error checking for updates");
      setUpdateState("error");
    }
  };

  const downloadUpdate = async (update = updateInfo) => {
    if (!update) return;
    setUpdateState("downloading");
    setShowTooltip(false);
    try {
      await update.download();
      setUpdateState("ready");
      setShowNotification(true);
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

  const handleTooltipAccept = () => {
    downloadUpdate();
  };

  const handleTooltipDismiss = () => {
    if (updateInfo) {
      dismissUpdate(updateInfo.version);
    }
    setShowTooltip(false);
    setUpdateState("none");
  };

  const getStateMessage = () => {
    switch (updateState) {
      case "checking":
        return "Verificando atualizações...";
      case "downloading":
        return "Baixando atualização...";
      case "ready":
        return "Atualização baixada e pronta para instalar";
      case "installing":
        return "Instalando atualização...";
      case "error":
        return `Erro: ${error}`;
      default:
        return "";
    }
  };

  return (
    <>
      <div className="relative">
        <div className="flex flex-row gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="flex cursor-pointer items-center justify-center text-gray-500 hover:text-gray-700"
            title="Configurações de atualização"
          >
            <Settings className="w-4 h-4" />
          </button>

          {settings.preference === "manual" && (
            <button
              onClick={checkForUpdates}
              disabled={updateState === "checking"}
              className="flex cursor-pointer items-center justify-center text-gray-500 hover:text-gray-700"
              title="Check for updates"
            >
              <RefreshCw
                className={clsx(
                  "w-4 h-4",
                  updateState === "checking" && "animate-spin"
                )}
              />
            </button>
          )}
        </div>

        {/* Tooltip para nova versão disponível */}
        {showTooltip && updateState === "available" && updateInfo && (
          <div
            className={clsx(
              "absolute bottom-full right-0 mb-2 p-3 rounded-lg shadow-xl z-50 w-64",
              "border transition-all duration-200",
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-300 text-gray-900"
            )}
          >
            <div className="flex items-start gap-2">
              <Download className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">
                  Nova versão disponível
                </h4>
                <p className="text-xs mb-3 opacity-80">
                  Versão {updateInfo.version} está disponível. Deseja baixar
                  agora?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleTooltipAccept}
                    className={clsx(
                      "px-3 py-1 text-xs rounded font-medium flex-1",
                      theme === "dark"
                        ? "bg-blue-700 hover:bg-blue-800 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    )}
                  >
                    Baixar
                  </button>
                  <button
                    onClick={handleTooltipDismiss}
                    className={clsx(
                      "px-3 py-1 text-xs rounded",
                      theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    )}
                  >
                    Depois
                  </button>
                </div>
              </div>
              <button
                onClick={handleTooltipDismiss}
                className={clsx(
                  "text-xs hover:opacity-70 flex-shrink-0",
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                )}
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Seta do tooltip */}
            <div
              className={clsx(
                "absolute top-full right-4 border-4 border-transparent",
                theme === "dark" ? "border-t-gray-800" : "border-t-white"
              )}
            />
          </div>
        )}
      </div>

      {/* Notificação quando atualização estiver pronta para instalar */}
      {showNotification && updateState === "ready" && (
        <div
          className={clsx(
            "fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-sm z-50 border",
            theme === "dark"
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-300 text-gray-900"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-medium text-sm mb-1">Pronto para instalar</h3>
              <p className="text-xs mb-3 opacity-80">
                A atualização foi baixada com sucesso.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => installUpdate()}
                  className={clsx(
                    "px-3 py-1 text-xs rounded font-medium flex-1",
                    theme === "dark"
                      ? "bg-green-700 hover:bg-green-800 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  )}
                >
                  Instalar e Reiniciar
                </button>
                <button
                  onClick={() => setShowNotification(false)}
                  className={clsx(
                    "px-3 py-1 text-xs rounded",
                    theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  )}
                >
                  Mais tarde
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className={clsx(
                "text-xs hover:opacity-70 flex-shrink-0",
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Indicador de estado (loading, error, etc.) */}
      {(updateState === "downloading" ||
        updateState === "installing" ||
        updateState === "error") && (
        <div
          className={clsx(
            "fixed bottom-4 right-4 p-3 rounded-lg shadow-lg z-50",
            theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-900",
            updateState === "error" && "border-l-4 border-red-500"
          )}
        >
          <div className="flex items-center gap-2">
            {(updateState === "downloading" ||
              updateState === "installing") && (
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            )}
            {updateState === "error" && (
              <div className="w-3 h-3 rounded-full bg-red-500" />
            )}
            <span className="text-sm">{getStateMessage()}</span>
          </div>
        </div>
      )}

      <UpdateSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

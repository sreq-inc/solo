import { useEffect, useState } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";

export const UpdateChecker = () => {
  const { theme } = useTheme();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>(null);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const update = await check();

      if (update?.available) {
        setUpdateAvailable(true);
        setUpdateInfo(update);
      }
    } catch (error) {
      console.error("Erro ao verificar atualizações:", error);
    }
  };

  const handleUpdate = async () => {
    if (!updateInfo) return;

    setIsUpdating(true);

    try {
      await updateInfo.downloadAndInstall();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      setIsUpdating(false);
    }
  };

  if (!updateAvailable) return null;

  return (
    <div
      className={clsx(
        "fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-sm z-50",
        theme === "dark"
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-300"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3
            className={clsx(
              "font-medium text-sm",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}
          >
            Atualização Disponível
          </h3>
          <p
            className={clsx(
              "text-xs mt-1",
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            )}
          >
            Versão {updateInfo?.version} está disponível
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className={clsx(
            "px-3 py-1 text-xs rounded font-medium",
            theme === "dark"
              ? "bg-purple-700 hover:bg-purple-800 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white",
            isUpdating && "opacity-50 cursor-not-allowed"
          )}
        >
          {isUpdating ? "Atualizando..." : "Atualizar"}
        </button>

        <button
          onClick={() => setUpdateAvailable(false)}
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
  );
};

import { useState, useEffect } from "react";

export type UpdatePreference = "auto" | "notify" | "manual";

interface UpdateSettings {
  preference: UpdatePreference;
  checkInterval: number; // in hours
  allowPrerelease: boolean;
}

const DEFAULT_SETTINGS: UpdateSettings = {
  preference: "notify",
  checkInterval: 24,
  allowPrerelease: false,
};

export const useUpdateSettings = () => {
  const [settings, setSettings] = useState<UpdateSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem("update-settings");
      if (saved) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error("Error loading update settings:", error);
    }
  };

  const saveSettings = (newSettings: Partial<UpdateSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem("update-settings", JSON.stringify(updated));
  };

  const shouldCheckForUpdates = (): boolean => {
    if (settings.preference === "manual") return false;

    const lastCheck = localStorage.getItem("last-update-check");
    if (!lastCheck) return true;

    const lastCheckTime = new Date(lastCheck);
    const now = new Date();
    const hoursSinceLastCheck =
      (now.getTime() - lastCheckTime.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastCheck >= settings.checkInterval;
  };

  const markUpdateCheckTime = () => {
    localStorage.setItem("last-update-check", new Date().toISOString());
  };

  const isUpdateDismissed = (version: string): boolean => {
    return localStorage.getItem(`update-dismissed-${version}`) === "true";
  };

  const dismissUpdate = (version: string) => {
    localStorage.setItem(`update-dismissed-${version}`, "true");
  };

  const clearDismissedUpdates = () => {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("update-dismissed-")) {
        localStorage.removeItem(key);
      }
    });
  };

  return {
    settings,
    saveSettings,
    shouldCheckForUpdates,
    markUpdateCheckTime,
    isUpdateDismissed,
    dismissUpdate,
    clearDismissedUpdates,
  };
};

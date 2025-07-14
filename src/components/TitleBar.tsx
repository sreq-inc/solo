import clsx from "clsx";
import { useTheme } from "../context/ThemeContext";

import { platform } from '@tauri-apps/plugin-os';
import MacOsControls from "./WindowControl/MacOs";
import WindowsControls from "./WindowControl/Windows";
import LinuxControls from "./WindowControl/Linux";

const currentPlatform = platform();

export default function Titlebar() {
  const { theme } = useTheme();
  const appBg = theme === "dark" ? "bg-[#10121b]" : "bg-gray-100";
  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-700";

  return (
    <div
      className={clsx(
        "w-full h-8 flex items-center justify-between cursor-default",
        appBg,
        textColor,
        currentPlatform !== 'windows' ? 'px-3' : null
      )}
      data-tauri-drag-region
    >
      {currentPlatform === 'macos' && <MacOsControls textTheme={textColor}  />}
      {currentPlatform === 'windows' && <WindowsControls textTheme={textColor}  />}
      {currentPlatform === 'linux' && <LinuxControls textTheme={textColor}  />}
    </div>
  );
}

import clsx from "clsx";
import { useTheme } from "../context/ThemeContext";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function Titlebar() {
  const { theme } = useTheme();
  const appBg = theme === "dark" ? "bg-[#10121b]" : "bg-gray-100";
  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-700";

  const currentWindow = getCurrentWindow();

  const minimizeWindow = async () => {
    await currentWindow.minimize();
  };

  const maximizeWindow = async () => {
    await currentWindow.maximize();
  };

  const closeWindow = async () => {
    await currentWindow.close();
  };

  return (
    <div
      className={clsx(
        "w-full h-8 flex items-center justify-between px-3",
        appBg,
        textColor
      )}
      data-tauri-drag-region
    >
      <div className="flex items-center gap-2">
        <button
          onClick={closeWindow}
          className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/90 flex items-center justify-center"
        >
          <span className="opacity-0 hover:opacity-100 text-[8px] text-black">
            ✕
          </span>
        </button>
        <button
          onClick={minimizeWindow}
          className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/90 flex items-center justify-center"
        >
          <span className="opacity-0 hover:opacity-100 text-[8px] text-black">
            -
          </span>
        </button>
        <button
          onClick={maximizeWindow}
          className="w-3 h-3 rounded-full bg-[#28c940] hover:bg-[#28c940]/90 flex items-center justify-center"
        >
          <span className="opacity-0 hover:opacity-100 text-[8px] text-black">
            +
          </span>
        </button>
      </div>
      <div className={clsx("text-sm font-medium", textColor)}>Solo</div>
      <div className="w-[52px]"></div>
    </div>
  );
}

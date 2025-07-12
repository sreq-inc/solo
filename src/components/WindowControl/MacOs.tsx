import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import clsx from "clsx";
import { useEffect, useState } from "react";

export default function MacOsControls({textTheme}:WindowControlsTypes){
    const [isMaximized, setIsMaximized] = useState(false);
    const currentWindow = getCurrentWindow();

    const minimizeWindow = async () => {
        await currentWindow.minimize();
    };

    const maximizeWindow = async () => {
        try {
            if (isMaximized) {
                await currentWindow.setSize(new LogicalSize(1278, 829));
            } else {
                await currentWindow.maximize();
            }
            setIsMaximized(await currentWindow.isMaximized());
        } catch (error) {
            console.error('Failed to toggle maximize/restore:', error);
        }
    };

    const closeWindow = async () => {
        await currentWindow.close();
    };

    useEffect(() => {
        const resizeHandler = async () => {
            setIsMaximized(await currentWindow.isMaximized());
        };
        const unlistenPromise = currentWindow.onResized(resizeHandler);

        currentWindow.isMaximized().then(setIsMaximized);

        return () => {
            unlistenPromise.then((fn) => fn());
        };
    }, [currentWindow])

    return(
        <>
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
            <div className={clsx("text-sm font-medium", textTheme)}>Solo</div>
            <div className="w-[52px]"></div>
        </>
    )
}
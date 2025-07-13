import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import clsx from 'clsx';
import { Minus, X, Maximize2, Minimize2 } from 'lucide-react';
import { useEffect, useState } from 'react';


export default function LinuxControls({textTheme}: WindowControlsTypes) {
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
    }, [currentWindow]);

    return (
        <>
            <section className="flex gap-2">
                <button
                onClick={closeWindow}
                className="size-6 rounded-full bg-red-500 hover:bg-red-800 flex items-center justify-center transition-colors"
                aria-label="Fechar"
                >
                    <X  className="text-white size-4" />
                </button>
                <button
                onClick={minimizeWindow}
                className="size-6 rounded-full bg-yellow-500 hover:bg-yellow-800 flex items-center justify-center transition-colors"
                aria-label="Minimizar"
                >
                    <Minus  className="text-white size-4" />
                </button>
                <button
                onClick={maximizeWindow}
                className="size-6 rounded-full bg-green-500 hover:bg-green-800 flex items-center justify-center transition-colors"
                aria-label="Maximizar"
                >
                    {isMaximized ? (
                        <Minimize2  className="text-white size-4" />
                    ) : (
                        <Maximize2  className="text-white size-4" />
                    )}
                </button>
            </section>
            <div className={clsx("text-sm font-medium", textTheme)}>Solo</div>
            <div />
        </>
    );
}
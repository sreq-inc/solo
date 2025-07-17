import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import clsx from 'clsx';
import { Minus, Square, X, SquaresSubtract } from 'lucide-react';
import { useEffect, useState } from 'react';


export default function WindowsControls({textTheme}: WindowControlsTypes) {
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
            <div />
            <div className={clsx("text-sm font-medium", textTheme)}>Solo</div>
            <section className="h-full grid grid-cols-3 items-center">
                <button onClick={minimizeWindow} className="h-full flex items-center justify-center bg-transparent px-4 hover:bg-neutral-500/10">
                    <Minus size={12}  />
                </button>
                <button onClick={maximizeWindow} className="h-full flex items-center justify-center bg-transparent px-4 hover:bg-neutral-500/10">
                    {isMaximized ? <SquaresSubtract size={12}   /> : <Square size={12}  />}
                </button>
                <button onClick={closeWindow} className="h-full flex items-center justify-center bg-transparent px-4 hover:bg-red-600">
                    <X size={16}  />
                </button>
            </section>
        </>
    );
}
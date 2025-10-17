import clsx from "clsx";
import { useTheme } from "./context/ThemeContext";
import { Sidebar } from "./components/Sidebar";
import { RequestForm } from "./components/RequestForm";
import { ResponseView } from "./components/ResponseView";
import "./App.css";
import Titlebar from "./components/TitleBar";
import { InputMethod } from "./components/InputMethod";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useLayoutEffect } from "react";

function App() {
  const { theme } = useTheme();
  const appBg = theme === "dark" ? "bg-[#10121b]" : "bg-[#f0eee6]";
  const cardBg = theme === "dark" ? "bg-[#1a1c25]" : "bg-gray-200";

  const [splitPosition, setSplitPosition] = useState(40); // Percentage for left panel
  const [isResizing, setIsResizing] = useState(false);
  const [isRequestCollapsed, setIsRequestCollapsed] = useState(false);

  useLayoutEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const container = document.getElementById('split-container');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Limit between 20% and 70%
      if (percentage >= 20 && percentage <= 70) {
        setSplitPosition(percentage);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="flex flex-col h-screen">
      <Titlebar />
      <ToastContainer />
      <div
        className={clsx(
          "flex-1 flex transition-colors duration-200 overflow-hidden",
          appBg
        )}
      >
        <div
          className={clsx(
            "w-full flex rounded-xl shadow-lg overflow-hidden",
            cardBg
          )}
        >
          <div className="flex w-full overflow-hidden">
            <Sidebar />
            <section className="flex flex-col w-full px-4 overflow-hidden">
              {/* Área fixa: InputMethod */}
              <div className="py-3 px-4 flex-shrink-0">
                <InputMethod />
              </div>
              {/* Área com scroll: RequestForm e ResponseView com split resizable */}
              <div id="split-container" className="flex flex-1 overflow-hidden pb-4 gap-1 relative">
                {/* Request Form Panel */}
                <div
                  className={clsx(
                    "flex flex-col overflow-y-auto transition-all duration-300",
                    isRequestCollapsed ? "w-0 opacity-0" : ""
                  )}
                  style={{
                    width: isRequestCollapsed ? '0%' : `${splitPosition}%`,
                  }}
                >
                  {!isRequestCollapsed && <RequestForm />}
                </div>

                {/* Resize Handle */}
                {!isRequestCollapsed && (
                  <div
                    className={clsx(
                      "w-1 cursor-col-resize relative flex-shrink-0 group",
                      theme === "dark" ? "hover:bg-purple-600" : "hover:bg-purple-500"
                    )}
                    onMouseDown={() => setIsResizing(true)}
                  >
                    <div
                      className={clsx(
                        "absolute inset-y-0 -left-1 w-3 group-hover:bg-opacity-20",
                        theme === "dark" ? "group-hover:bg-purple-600" : "group-hover:bg-purple-500"
                      )}
                    />
                  </div>
                )}

                {/* Response View Panel */}
                <div
                  className="flex flex-col overflow-y-auto flex-1 relative"
                  style={{
                    width: isRequestCollapsed ? '100%' : `${100 - splitPosition}%`,
                  }}
                >
                  <ResponseView
                    isRequestCollapsed={isRequestCollapsed}
                    onToggleCollapse={() => setIsRequestCollapsed(!isRequestCollapsed)}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

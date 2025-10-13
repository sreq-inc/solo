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

function App() {
  const { theme } = useTheme();
  const appBg = theme === "dark" ? "bg-[#10121b]" : "bg-[#f0eee6]";
  const cardBg = theme === "dark" ? "bg-[#1a1c25]" : "bg-gray-200";

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
              <div className="p-4 space-y-4 flex-shrink-0">
                <InputMethod />
              </div>
              {/* Área com scroll: RequestForm e ResponseView */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1 overflow-hidden pb-4">
                <div className="flex flex-col overflow-y-auto">
                  <RequestForm />
                </div>
                <div className="flex flex-col overflow-y-auto">
                  <ResponseView />
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

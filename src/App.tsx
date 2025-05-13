import clsx from "clsx";
import { useTheme } from "./context/ThemeContext";
import { Sidebar } from "./components/Sidebar";
import { RequestForm } from "./components/RequestForm";
import { ResponseView } from "./components/ResponseView";
import { InputMethod } from "./components/InputMethod";
import "./App.css";
// import Titlebar from "./components/TitleBar";

function App() {
  const { theme } = useTheme();

  const appBg = theme === "dark" ? "bg-[#10121b]" : "bg-[#f0eee6]";
  const cardBg = theme === "dark" ? "bg-[#1a1c25]" : "bg-gray-200";

  return (
    <div className="flex flex-col h-screen">
      {/* <Titlebar /> */}
      <div
        className={clsx("flex-1 flex transition-colors duration-200", appBg)}
      >
        <div className={clsx("w-full flex rounded-xl shadow-lg", cardBg)}>
          <div className="grid grid-cols-12 w-full">
            <Sidebar />
            <section className="col-span-10 flex flex-col w-full px-4">
              <div className="p-4 space-y-4">
                <InputMethod />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
                <div className="flex flex-col">
                  <RequestForm />
                </div>
                <div className="flex flex-col">
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

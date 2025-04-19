import { Sidebar } from "./components/Sidebar";
import { RequestForm } from "./components/RequestForm";
import { ResponseView } from "./components/ResponseView";
import { useTheme } from "./context/ThemeContext";
import "./App.css";
import clsx from "clsx";

function App() {
  const { theme } = useTheme();

  return (
    <div
      className={clsx(
        "flex items-center justify-center p-4 h-screen transition-colors duration-200",
        theme === "dark" ? "bg-gray-900" : "bg-[#f0eee6]"
      )}
    >
      <div
        className={clsx(
          "w-full h-full rounded-xl shadow-lg",
          theme === "dark" ? "shadow-gray-900" : "shadow-gray-200"
        )}
      >
        <div className="grid grid-cols-12 gap-4 h-full">
          <Sidebar />
          <RequestForm />
          <ResponseView />
        </div>
      </div>
    </div>
  );
}

export default App;

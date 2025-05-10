import clsx from "clsx";
import { useRequest } from "../context/RequestContext";
import { SelectMethod } from "./SelectMethod";
import { useTheme } from "../context/ThemeContext";

export const InputMethod = () => {
  const { method, url, loading, setMethod, setUrl, handleRequest } =
    useRequest();
  const { theme } = useTheme();

  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 w-20 mr-2">
        <SelectMethod
          value={method}
          options={["GET", "POST", "PUT", "DELETE", "PATCH"]}
          onChange={(value) =>
            setMethod(value as "GET" | "POST" | "PUT" | "DELETE" | "PATCH")
          }
        />
      </div>
      <div className="flex-grow">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/endpoint"
          className={clsx(
            "w-full h-10 p-2 border rounded outline-none",
            theme === "dark"
              ? "bg-gray-700 text-white border-2 border-purple-500 focus:border-purple-500 focus:ring-0"
              : "bg-white text-gray-800 border-2 border-purple-500 focus:border-purple-500 focus:ring-0"
          )}
        />
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={handleRequest}
          disabled={loading}
          className={clsx(
            "p-2 h-10 text-white rounded cursor-pointer w-28",
            theme === "dark"
              ? "bg-purple-700 hover:bg-purple-800"
              : "bg-purple-600 hover:bg-purple-700",
            loading && "opacity-50 cursor-not-allowed"
          )}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

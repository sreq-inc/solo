import clsx from "clsx";
import { useRequest } from "../context/RequestContext";
import { SelectMethod } from "./SelectMethod";
import { useTheme } from "../context/ThemeContext";

export const InputMethod = () => {
  const { method, url, loading, requestType, setMethod, setUrl, handleRequest } =
    useRequest();
  const { theme } = useTheme();

  const getPlaceholderUrl = () => {
    if (requestType === "graphql") {
      return "https://api.example.com/graphql";
    }
    return "https://api.example.com/endpoint";
  };

  const getAvailableMethods = () => {
    if (requestType === "graphql") {
      return ["POST"]; // GraphQL typically uses POST
    }
    return ["GET", "POST", "PUT", "DELETE", "PATCH"];
  };

  return (
    <div className="flex items-center gap-4">
      {requestType === "http" && (
        <div className="flex-shrink-0 w-24 mr-2">
          <SelectMethod
            value={method}
            options={getAvailableMethods()}
            onChange={(value) =>
              setMethod(value as "GET" | "POST" | "PUT" | "DELETE" | "PATCH")
            }
          />
        </div>
      )}

      {requestType === "graphql" && (
        <div className="flex-shrink-0 w-24 mr-2">
          <div
            className={clsx(
              "block appearance-none w-full border rounded-lg py-2 px-4 pr-8 leading-tight text-center font-medium",
              theme === "dark"
                ? "text-white bg-[#10121b] border-purple-500 border-2"
                : "text-gray-700 bg-white border-purple-500 border-2"
            )}
          >
            GQL
          </div>
        </div>
      )}

      <div className="flex-grow">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={getPlaceholderUrl()}
          className={clsx(
            "w-full h-10 p-2 border rounded outline-none focus:ring-0",
            theme === "dark"
              ? "bg-[#10121b] text-white border-2 border-purple-500 focus:border-purple-500"
              : "bg-white text-gray-800 border-2 border-purple-500 focus:border-purple-500"
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
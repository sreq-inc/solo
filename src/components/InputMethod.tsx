import clsx from "clsx";
import { useRequest } from "../context/RequestContext";
import { useVariables } from "../context/VariablesContext";
import { SelectMethod } from "./SelectMethod";
import { SmartUrlInput } from "./SmartUrlInput";
import { useTheme } from "../context/ThemeContext";

export const InputMethod = () => {
  const { method, url, loading, setMethod, setUrl, handleRequest } =
    useRequest();
  const { replaceVariablesInUrl } = useVariables();
  const { theme } = useTheme();

  const handleRequestWithVariables = async () => {
    const processedUrl = replaceVariablesInUrl(url);

    if (processedUrl.includes("{{")) {
      const unresolvedVars = processedUrl.match(/\{\{[^}]+\}\}/g);
      alert(
        `Some variables are not defined: ${unresolvedVars?.join(
          ", "
        )}\nCheck the Variables tab.`
      );
      return;
    }

    if (!processedUrl.trim()) {
      alert("URL is required");
      return;
    }

    if (
      !processedUrl.startsWith("http://") &&
      !processedUrl.startsWith("https://")
    ) {
      alert(
        `URL must start with http:// or https://\nCurrent URL: "${processedUrl}"`
      );
      return;
    }

    try {
      await handleRequest(processedUrl);
    } catch (error) {
      console.error("Request error:", error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 w-24 mr-2">
        <SelectMethod
          value={method}
          options={["GET", "POST", "PUT", "DELETE", "PATCH"]}
          onChange={(value) =>
            setMethod(value as "GET" | "POST" | "PUT" | "DELETE" | "PATCH")
          }
        />
      </div>
      <div className="flex-grow">
        <SmartUrlInput
          value={url}
          onChange={setUrl}
          placeholder="https://api.example.com/users or {{baseUrl}}/users"
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
          onClick={handleRequestWithVariables}
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

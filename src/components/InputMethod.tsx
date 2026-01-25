import clsx from "clsx";
import { Loader2, Trash2 } from "lucide-react";
import { useRequest } from "../context/RequestContext";
import { useTheme } from "../context/ThemeContext";
import { useVariables } from "../context/VariablesContext";
import { useEnvironment } from "../hooks/useEnvironment";
import { useToast } from "../hooks/useToast";
import { EnvironmentSelector } from "./EnvironmentSelector";
import { SelectMethod } from "./SelectMethod";
import { SmartUrlInput } from "./SmartUrlInput";

export const InputMethod = () => {
  const {
    method,
    url,
    loading,
    requestType,
    setMethod,
    setUrl,
    handleRequest,
    resetFields,
  } = useRequest();
  const { replaceVariablesInUrl } = useVariables();
  const { replaceEnvironmentVariables } = useEnvironment();
  const { theme } = useTheme();
  const toast = useToast();

  const handleRequestWithVariables = async () => {
    // First apply environment variables, then folder variables
    let processedUrl = replaceEnvironmentVariables(url);
    processedUrl = replaceVariablesInUrl(processedUrl);

    if (processedUrl.includes("{{")) {
      const unresolvedVars = processedUrl.match(/\{\{[^}]+\}\}/g);
      toast.warning(
        `Some variables are not defined: ${unresolvedVars?.join(
          ", "
        )}\nCheck the Variables tab.`
      );
      return;
    }

    if (!processedUrl.trim()) {
      toast.warning("URL is required");
      return;
    }

    // Validate URL scheme by request type
    if (requestType === "grpc") {
      if (!processedUrl.startsWith("grpc://")) {
        toast.warning(
          `For gRPC requests, URL must start with grpc://\nCurrent URL: "${processedUrl}"`
        );
        return;
      }
    } else {
      if (
        !processedUrl.startsWith("http://") &&
        !processedUrl.startsWith("https://")
      ) {
        toast.warning(
          `URL must start with http:// or https://\nCurrent URL: "${processedUrl}"`
        );
        return;
      }
    }

    try {
      await handleRequest(processedUrl);
    } catch (error) {
      console.error("Request error:", error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
        <EnvironmentSelector />
      </div>
      {requestType === "http" && (
        <div className="flex-shrink-0 w-24 mr-2">
          <SelectMethod
            value={method}
            options={["GET", "POST", "PUT", "DELETE", "PATCH"]}
            onChange={(value) =>
              setMethod(value as "GET" | "POST" | "PUT" | "DELETE" | "PATCH")
            }
          />
        </div>
      )}
      <div className="flex-grow">
        <SmartUrlInput
          value={url}
          onChange={setUrl}
          placeholder={
            requestType === "grpc"
              ? "grpc://localhost:50051 or {{grpcUrl}}"
              : "https://api.example.com/users or {{baseUrl}}/users"
          }
          className={clsx(
            "w-full h-10 p-2 rounded-md border outline-none",
            theme === "dark"
              ? "bg-gray-800 text-gray-200 border-gray-700"
              : "bg-white text-gray-700 border-gray-300"
          )}
        />
      </div>
      <div className="flex-shrink-0 flex gap-2">
        <button
          onClick={resetFields}
          disabled={loading}
          title="Clear all fields"
          className={clsx(
            "p-2 h-10 rounded cursor-pointer w-10 flex items-center justify-center",
            theme === "dark"
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
              : "bg-gray-300 hover:bg-gray-400 text-gray-700",
            loading && "opacity-50 cursor-not-allowed"
          )}
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleRequestWithVariables}
          disabled={loading}
          title={loading ? "Sending request..." : "Send request"}
          className={clsx(
            "p-2 h-10 text-white rounded cursor-pointer flex items-center justify-center gap-2",
            loading ? "w-32" : "w-28",
            theme === "dark"
              ? "bg-purple-700 hover:bg-purple-800"
              : "bg-purple-600 hover:bg-purple-700",
            loading && "opacity-50 cursor-not-allowed"
          )}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

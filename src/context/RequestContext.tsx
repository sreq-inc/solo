import { createContext, useContext, useState, ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type Tab = "body" | "auth" | "params" | "variables";

export type QueryParam = {
  key: string;
  value: string;
  enabled: boolean;
};

type RequestContextType = {
  method: HttpMethod;
  url: string;
  payload: string;
  username: string;
  password: string;
  useBasicAuth: boolean;
  activeTab: Tab;
  bearerToken: string;
  queryParams: QueryParam[];
  loading: boolean;
  response: any;
  error: string | null;
  isCopied: boolean;
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setPayload: (payload: string) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setUseBasicAuth: (useBasicAuth: boolean) => void;
  setActiveTab: (tab: Tab) => void;
  setBearerToken: (token: string) => void;
  setQueryParams: (params: QueryParam[]) => void;
  handleRequest: (customUrl?: string) => Promise<void>;
  resetFields: () => void;
  formatJson: () => void;
  handleCopyResponse: () => void;
};

const RequestContext = createContext<RequestContextType | undefined>(undefined);

interface RequestProviderProps {
  children: ReactNode;
}

function RequestProvider({ children }: RequestProviderProps) {
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState("");
  const [payload, setPayload] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [useBasicAuth, setUseBasicAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("body");
  const [bearerToken, setBearerToken] = useState("");
  const [queryParams, setQueryParams] = useState<QueryParam[]>([
    { key: "", value: "", enabled: true },
  ]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const resetFields = () => {
    setMethod("GET");
    setUrl("");
    setPayload("");
    setUsername("");
    setPassword("");
    setUseBasicAuth(false);
    setActiveTab("body");
    setResponse(null);
    setError(null);
    setBearerToken("");
    setIsCopied(false);
    setQueryParams([{ key: "", value: "", enabled: true }]);
  };

  const formatJson = () => {
    try {
      const sanitized = payload.replace(/[""]/g, '"').replace(/['']/g, "'");
      const parsed = JSON.parse(sanitized);
      setPayload(JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.error("Invalid JSON");
      alert("Invalid JSON format. Please correct it before formatting.");
    }
  };

  const handleRequest = async (customUrl?: string) => {
    console.log("🔥 HANDLEREQUEST INICIADO");

    // Usa a URL customizada se fornecida, senão usa a URL do estado
    const finalUrl = customUrl || url;

    console.log("📋 Parâmetros da requisição:");
    console.log("  - Method:", method);
    console.log("  - URL do estado:", url);
    console.log("  - URL customizada:", customUrl);
    console.log("  - URL final:", finalUrl);
    console.log("  - Payload:", payload);
    console.log("  - UseBasicAuth:", useBasicAuth);
    console.log("  - BearerToken:", bearerToken);
    console.log("  - Username:", username);
    console.log("  - Password:", password ? "***" : "(vazio)");

    setLoading(true);
    setError(null);
    setIsCopied(false);
    setResponse(null);

    try {
      const urlToUse = finalUrl.trim();
      console.log("🌐 URL final para requisição:", urlToUse);

      if (!urlToUse) {
        throw new Error("URL is required");
      }
      if (!urlToUse.startsWith("http://") && !urlToUse.startsWith("https://")) {
        throw new Error("URL must start with http:// or https://");
      }

      const body = payload.trim() ? JSON.parse(payload) : null;
      console.log("📦 Body da requisição:", body);

      let result;
      let invokeCommand;
      let invokeParams;

      if (useBasicAuth) {
        invokeCommand = "basic_auth_request";
        invokeParams = {
          method,
          url: urlToUse,
          body,
          username,
          password,
        };
      } else if (bearerToken.trim()) {
        invokeCommand = "bearer_auth_request";
        invokeParams = {
          method,
          url: urlToUse,
          body,
          bearerToken,
        };
      } else {
        invokeCommand = "plain_request";
        invokeParams = {
          method,
          url: urlToUse,
          body,
        };
      }

      console.log("🚀 Chamando invoke:");
      console.log("  - Comando:", invokeCommand);
      console.log("  - Parâmetros:", invokeParams);

      result = await invoke(invokeCommand, invokeParams);

      console.log("✅ Resposta recebida do backend:");
      console.log("  - Tipo:", typeof result);
      console.log("  - Conteúdo:", result);

      setResponse(result);
      console.log("✅ Response setado no estado");
    } catch (error) {
      console.error("❌ Erro na requisição:");
      console.error("  - Tipo:", typeof error);
      console.error("  - Erro:", error);
      console.error("  - Stack:", error instanceof Error ? error.stack : "N/A");

      setResponse(null);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      console.log(
        "❌ Error setado no estado:",
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
      console.log("🏁 Loading definido como false");
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setIsCopied(true);
  };

  const contextValue: RequestContextType = {
    method,
    url,
    payload,
    username,
    password,
    useBasicAuth,
    activeTab,
    bearerToken,
    queryParams,
    loading,
    response,
    error,
    isCopied,
    setMethod,
    setUrl,
    setPayload,
    setUsername,
    setPassword,
    setUseBasicAuth,
    setActiveTab,
    setBearerToken,
    setQueryParams,
    handleRequest,
    resetFields,
    formatJson,
    handleCopyResponse,
  };

  return (
    <RequestContext.Provider value={contextValue}>
      {children}
    </RequestContext.Provider>
  );
}

function useRequest(): RequestContextType {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error("useRequest must be used within a RequestProvider");
  }
  return context;
}

export { RequestProvider, useRequest };

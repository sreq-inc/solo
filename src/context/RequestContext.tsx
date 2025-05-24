import { createContext, useContext, useState, ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type Tab = "body" | "auth";

type RequestContextType = {
  method: HttpMethod;
  url: string;
  payload: string;
  username: string;
  password: string;
  useBasicAuth: boolean;
  activeTab: Tab;
  bearerToken: string;
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
  handleRequest: () => Promise<void>;
  resetFields: () => void;
  formatJson: () => void;
  handleCopyResponse: () => void;
};

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider = ({ children }: { children: ReactNode }) => {
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState("");
  const [payload, setPayload] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [useBasicAuth, setUseBasicAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("body");
  const [bearerToken, setBearerToken] = useState("");
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
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(payload);
      setPayload(JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.error("Invalid JSON");
    }
  };

  const handleRequest = async () => {
    setLoading(true);
    setError(null);
    setIsCopied(false);

    try {
      const body = payload.trim() ? JSON.parse(payload) : null;

      let result;
      if (useBasicAuth) {
        result = await invoke("basic_auth_request", {
          method,
          url,
          body,
          username,
          password,
        });
      } else if (bearerToken.trim()) {
        result = await invoke("bearer_auth_request", {
          method,
          url,
          body,
          bearerToken,
        });
      } else {
        result = await invoke("plain_request", {
          method,
          url,
          body,
        });
      }

      setResponse(result);
    } catch (error) {
      setResponse(null);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleCopyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setIsCopied(true);
  };

  return (
    <RequestContext.Provider
      value={{
        method,
        url,
        payload,
        username,
        password,
        useBasicAuth,
        activeTab,
        bearerToken,
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
        handleRequest,
        resetFields,
        formatJson,
        handleCopyResponse,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequest = () => {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error("useRequest must be used within a RequestProvider");
  }
  return context;
};

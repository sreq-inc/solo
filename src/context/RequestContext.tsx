import { createContext, useContext, useState, ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";

export type Tab = "body" | "auth" | "params" | "graphql" | "variables";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type RequestType = "http" | "graphql";

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
  requestType: RequestType;
  graphqlQuery: string;
  graphqlVariables: string;
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setPayload: (payload: string) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setUseBasicAuth: (useBasicAuth: boolean) => void;
  setActiveTab: (tab: Tab) => void;
  setBearerToken: (token: string) => void;
  setQueryParams: (params: QueryParam[]) => void;
  setRequestType: (type: RequestType) => void;
  setGraphqlQuery: (query: string) => void;
  setGraphqlVariables: (variables: string) => void;
  handleRequest: (processedUrl?: string) => Promise<void>;
  resetFields: () => void;
  formatJson: () => void;
  formatGraphqlVariables: () => void;
  handleCopyResponse: () => void;
};

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider = ({ children }: { children: ReactNode }) => {
  const [method, setMethod] = useState<HttpMethod>("POST");
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
  const [requestType, setRequestType] = useState<RequestType>("http");
  const [graphqlQuery, setGraphqlQuery] = useState("");
  const [graphqlVariables, setGraphqlVariables] = useState("{}");

  const resetFields = () => {
    setMethod(requestType === "graphql" ? "POST" : "GET");
    setUrl("");
    setPayload("");
    setUsername("");
    setPassword("");
    setUseBasicAuth(false);
    setActiveTab(requestType === "graphql" ? "graphql" : "body");
    setResponse(null);
    setError(null);
    setBearerToken("");
    setIsCopied(false);
    setQueryParams([{ key: "", value: "", enabled: true }]);
    setGraphqlQuery("");
    setGraphqlVariables("{}");
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

  const formatGraphqlVariables = () => {
    try {
      const sanitized = graphqlVariables
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'");
      const parsed = JSON.parse(sanitized);
      setGraphqlVariables(JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.error("Invalid JSON");
      alert("Invalid JSON format. Please correct it before formatting.");
    }
  };

  const handleRequest = async (processedUrl?: string) => {
    setLoading(true);
    setError(null);
    setIsCopied(false);

    const finalUrl = processedUrl || url;

    try {
      let result;
      if (requestType === "graphql") {
        const variables = graphqlVariables.trim()
          ? JSON.parse(graphqlVariables)
          : {};
        if (useBasicAuth) {
          result = await invoke("graphql_basic_auth_request", {
            url: finalUrl,
            query: graphqlQuery,
            variables,
            username,
            password,
          });
        } else if (bearerToken.trim()) {
          result = await invoke("graphql_bearer_auth_request", {
            url: finalUrl,
            query: graphqlQuery,
            variables,
            bearerToken,
          });
        } else {
          result = await invoke("graphql_request", {
            url: finalUrl,
            query: graphqlQuery,
            variables,
          });
        }
      } else {
        const body = payload.trim() ? JSON.parse(payload) : null;
        if (useBasicAuth) {
          result = await invoke("basic_auth_request", {
            method,
            url: finalUrl,
            body,
            username,
            password,
          });
        } else if (bearerToken.trim()) {
          result = await invoke("bearer_auth_request", {
            method,
            url: finalUrl,
            body,
            bearerToken,
          });
        } else {
          result = await invoke("plain_request", {
            method,
            url: finalUrl,
            body,
          });
        }
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
        queryParams,
        loading,
        response,
        error,
        isCopied,
        requestType,
        graphqlQuery,
        graphqlVariables,
        setMethod,
        setUrl,
        setPayload,
        setUsername,
        setPassword,
        setUseBasicAuth,
        setActiveTab,
        setBearerToken,
        setQueryParams,
        setRequestType,
        setGraphqlQuery,
        setGraphqlVariables,
        handleRequest,
        resetFields,
        formatJson,
        formatGraphqlVariables,
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

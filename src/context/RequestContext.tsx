import { createContext, useContext, useState, ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useVariables } from "./VariablesContext";
import { useToast } from "../hooks/useToast";

export type Tab =
  | "body"
  | "auth"
  | "params"
  | "graphql"
  | "grpc"
  | "proto"
  | "variables"
  | "description"
  | "schema"
  | "metadata";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type RequestType = "http" | "graphql" | "grpc";

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
  grpcService: string;
  grpcMethod: string;
  grpcMessage: string;
  grpcCallType:
    | "unary"
    | "server_streaming"
    | "client_streaming"
    | "bidirectional";
  grpcMetadata: string;
  protoContent: string;
  description: string;
  grpcSchema: {
    services: any[];
    messages: any[];
  };
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
  setGrpcService: (service: string) => void;
  setGrpcMethod: (method: string) => void;
  setGrpcMessage: (message: string) => void;
  setGrpcCallType: (
    type: "unary" | "server_streaming" | "client_streaming" | "bidirectional"
  ) => void;
  setGrpcMetadata: (metadataJson: string) => void;
  setProtoContent: (content: string) => void;
  setDescription: (description: string) => void;
  setGrpcSchema: (schema: { services: any[]; messages: any[] }) => void;
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
  const [grpcService, setGrpcService] = useState("");
  const [grpcMethod, setGrpcMethod] = useState("");
  const [grpcMessage, setGrpcMessage] = useState("{}");
  const [grpcCallType, setGrpcCallType] = useState<
    "unary" | "server_streaming" | "client_streaming" | "bidirectional"
  >("unary");
  const [protoContent, setProtoContent] = useState("");
  const [grpcMetadata, setGrpcMetadata] = useState<string>("{}");
  const [description, setDescription] = useState("");
  const [grpcSchema, setGrpcSchema] = useState<{
    services: any[];
    messages: any[];
  }>({ services: [], messages: [] });

  const { clearVariables } = useVariables();
  const toast = useToast();

  const resetFields = () => {
    setMethod(requestType === "graphql" ? "POST" : "GET");
    setUrl("");
    setPayload("");
    setUsername("");
    setPassword("");
    setUseBasicAuth(false);
    setActiveTab(
      requestType === "graphql"
        ? "graphql"
        : requestType === "grpc"
          ? "grpc"
          : "body"
    );
    setResponse(null);
    setError(null);
    setBearerToken("");
    setIsCopied(false);
    setQueryParams([{ key: "", value: "", enabled: true }]);
    setGraphqlQuery("");
    setGraphqlVariables("{}");
    setGrpcService("");
    setGrpcMethod("");
    setGrpcMessage("{}");
    setGrpcCallType("unary");
    setProtoContent("");
    setDescription("");
    setGrpcSchema({ services: [], messages: [] });
    clearVariables();
  };

  const formatJson = () => {
    try {
      const sanitized = payload.replace(/[""]/g, '"').replace(/['']/g, "'");
      const parsed = JSON.parse(sanitized);
      setPayload(JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.error("Invalid JSON");
      toast.error("Invalid JSON format. Please correct it before formatting.");
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
      toast.error("Invalid JSON format. Please correct it before formatting.");
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
      } else if (requestType === "grpc") {
        const message = grpcMessage.trim() ? JSON.parse(grpcMessage) : {};
        // Parse custom metadata if provided (JSON object)
        let customMetadata: Record<string, string> | undefined = undefined;
        try {
          if (grpcMetadata && grpcMetadata.trim()) {
            const parsed = JSON.parse(grpcMetadata);
            if (parsed && typeof parsed === "object") {
              customMetadata = Object.entries(parsed).reduce(
                (acc: Record<string, string>, [k, v]) => {
                  if (v !== null && v !== undefined) acc[String(k)] = String(v);
                  return acc;
                },
                {}
              );
            }
          }
        } catch (_) {
          // ignore parse error here; UI will guide user
        }

        const authMetadata = bearerToken.trim()
          ? { authorization: `Bearer ${bearerToken}` }
          : undefined;

        const mergedMetadata = {
          ...(customMetadata || {}),
          ...(authMetadata || {}),
        } as Record<string, string> | undefined;

        if (grpcCallType === "unary") {
          result = await invoke("grpc_unary_request", {
            url: finalUrl,
            service: grpcService,
            method: grpcMethod,
            message,
            metadata: Object.keys(mergedMetadata || {}).length
              ? mergedMetadata
              : undefined,
          });
        } else if (grpcCallType === "server_streaming") {
          result = await invoke("grpc_server_streaming_request", {
            url: finalUrl,
            service: grpcService,
            method: grpcMethod,
            message,
            metadata: Object.keys(mergedMetadata || {}).length
              ? mergedMetadata
              : undefined,
          });
        } else {
          // For now, handle other streaming types as unary
          result = await invoke("grpc_unary_request", {
            url: finalUrl,
            service: grpcService,
            method: grpcMethod,
            message,
            metadata: Object.keys(mergedMetadata || {}).length
              ? mergedMetadata
              : undefined,
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
        grpcService,
        grpcMethod,
        grpcMessage,
        grpcCallType,
        protoContent,
        grpcMetadata,
        description,
        grpcSchema,
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
        setGrpcService,
        setGrpcMethod,
        setGrpcMessage,
        setGrpcCallType,
        setProtoContent,
        setGrpcMetadata,
        setDescription,
        setGrpcSchema,
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

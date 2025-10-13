import { useTheme } from "../context/ThemeContext";
import { useRequest } from "../context/RequestContext";
import clsx from "clsx";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useToast } from "../hooks/useToast";

interface ProtoSchema {
  services: ProtoService[];
  messages: ProtoMessage[];
}

interface ProtoService {
  name: string;
  methods: ProtoMethod[];
}

interface ProtoMethod {
  name: string;
  input_type: string;
  output_type: string;
  is_client_streaming: boolean;
  is_server_streaming: boolean;
}

interface ProtoMessage {
  name: string;
  fields: ProtoField[];
}

interface ProtoField {
  name: string;
  field_type: string;
  number: number;
  repeated: boolean;
}

export const GrpcEditor = () => {
  const { theme } = useTheme();
  const {
    grpcService,
    grpcMethod,
    grpcMessage,
    grpcCallType,
    protoContent,
    url,
    setGrpcService,
    setGrpcMethod,
    setGrpcMessage,
    setGrpcCallType,
    setProtoContent,
    setGrpcSchema,
  } = useRequest();
  const toast = useToast();

  const [services, setServices] = useState<ProtoService[]>([]);
  const [methods, setMethods] = useState<ProtoMethod[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [jsonError, setJsonError] = useState<string>("");
  const [testingConnection, setTestingConnection] = useState(false);
  const [isJsonValid, setIsJsonValid] = useState(true);

  // Validate JSON in real-time
  useEffect(() => {
    if (!grpcMessage.trim()) {
      setJsonError("");
      setIsJsonValid(true);
      return;
    }

    try {
      JSON.parse(grpcMessage);
      setJsonError("");
      setIsJsonValid(true);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Invalid JSON";
      setJsonError(errorMsg);
      setIsJsonValid(false);
    }
  }, [grpcMessage]);

  // Parse proto content when it changes (silently, without toasts)
  useEffect(() => {
    if (protoContent.trim()) {
      parseProtoContent(false);
    }
  }, [protoContent]);

  // Update methods when service changes
  useEffect(() => {
    if (grpcService) {
      const selectedService = services.find((s) => s.name === grpcService);
      if (selectedService) {
        setMethods(selectedService.methods);
        // Auto-select first method
        if (selectedService.methods.length > 0 && !grpcMethod) {
          setGrpcMethod(selectedService.methods[0].name);
        }
      }
    }
  }, [grpcService, services]);

  const parseProtoContent = async (showToast: boolean = true) => {
    setIsParsing(true);

    try {
      const result = (await invoke("grpc_parse_proto_file", {
        content: protoContent,
      })) as any;

      // Support both shapes:
      // - Raw ProtoSchema (Tauri Ok)
      // - { success, data } (legacy shape)
      const schema: ProtoSchema | undefined = result?.services
        ? (result as ProtoSchema)
        : result?.data;

      if (schema && Array.isArray(schema.services)) {
        setServices(schema.services);
        setGrpcSchema({
          services: schema.services,
          messages: schema.messages || [],
        });

        if (showToast) {
          if (schema.services.length === 0) {
            toast.warning("No services found in proto file");
          } else {
            toast.success(`Found ${schema.services.length} service${schema.services.length !== 1 ? "s" : ""}`);
          }
        }
      } else {
        if (showToast) {
          toast.error(result?.error || "Failed to parse proto file");
        }
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to parse proto file";
      if (showToast) {
        toast.error(errorMsg);
      }
      console.error("Failed to parse proto file:", error);
    } finally {
      setIsParsing(false);
    }
  };

  const discoverServices = async () => {
    if (!url) {
      toast.warning("Please enter a URL first");
      return;
    }

    setIsDiscovering(true);

    try {
      const result = (await invoke("grpc_discover_services", {
        url: url,
      })) as any;

      const schema: ProtoSchema | undefined = result?.services
        ? (result as ProtoSchema)
        : result?.data;

      if (schema && Array.isArray(schema.services)) {
        setServices(schema.services);
        setProtoContent("// Services discovered via reflection");
        setGrpcSchema({
          services: schema.services,
          messages: schema.messages || [],
        });

        if (schema.services.length === 0) {
          toast.warning("No services found at this URL");
        } else {
          toast.success(`Discovered ${schema.services.length} service${schema.services.length !== 1 ? "s" : ""} via reflection`);
        }
      } else {
        toast.error(result?.error || "Failed to discover services");
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to discover services";
      toast.error(errorMsg);
      console.error("Failed to discover services:", error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const testConnection = async () => {
    if (!url) {
      toast.warning("Please enter a URL first");
      return;
    }

    setTestingConnection(true);

    try {
      const result = (await invoke("grpc_test_connection", {
        url: url,
      })) as { connected: boolean; message: string; latency_ms?: number };

      if (result.connected) {
        const latencyMsg = result.latency_ms ? ` (${result.latency_ms}ms)` : "";
        toast.success(`${result.message}${latencyMsg}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to test connection";
      toast.error(errorMsg);
    } finally {
      setTestingConnection(false);
    }
  };

  const formatGrpcMessage = () => {
    try {
      const sanitized = grpcMessage.replace(/[""]/g, '"').replace(/['']/g, "'");
      const parsed = JSON.parse(sanitized);
      setGrpcMessage(JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.error("Invalid JSON");
      toast.error("Invalid JSON format. Please correct it before formatting.");
    }
  };

  const getCallTypeLabel = (type: string) => {
    switch (type) {
      case "unary":
        return "Unary";
      case "server_streaming":
        return "Server Streaming";
      case "client_streaming":
        return "Client Streaming";
      case "bidirectional":
        return "Bidirectional";
      default:
        return type;
    }
  };

  const getCallTypeDescription = (type: string) => {
    switch (type) {
      case "unary":
        return "Single request, single response";
      case "server_streaming":
        return "Single request, multiple responses";
      case "client_streaming":
        return "Multiple requests, single response";
      case "bidirectional":
        return "Multiple requests, multiple responses";
      default:
        return "";
    }
  };

  return (
    <div className="mt-4 space-y-6">
      {/* Proto File Input */}
      <div>
        <label
          className={clsx(
            "block text-sm mb-2",
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          )}
        >
          Proto File Content
        </label>
        <div className="space-y-2 mb-2">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => parseProtoContent(true)}
              disabled={!protoContent.trim() || isParsing}
              title="Parse proto file content to extract services and methods"
              className={clsx(
                "px-3 py-1 text-xs rounded font-medium transition-colors",
                theme === "dark"
                  ? "bg-purple-700 hover:bg-purple-800 text-white disabled:bg-gray-700 disabled:text-gray-400"
                  : "bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-400 disabled:text-gray-600"
              )}
            >
              {isParsing ? "Parsing..." : "Parse Proto"}
            </button>
            <button
              onClick={discoverServices}
              disabled={isDiscovering || !url}
              title="Automatically discover services via gRPC reflection (server must support reflection)"
              className={clsx(
                "px-3 py-1 text-xs rounded font-medium transition-colors",
                theme === "dark"
                  ? "bg-blue-700 hover:bg-blue-800 text-white disabled:bg-gray-700 disabled:text-gray-400"
                  : "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:text-gray-600"
              )}
            >
              {isDiscovering ? "Discovering..." : "Discover Services"}
            </button>
            <button
              onClick={testConnection}
              disabled={testingConnection || !url}
              title="Test connectivity to gRPC server and measure latency"
              className={clsx(
                "px-3 py-1 text-xs rounded font-medium transition-colors",
                theme === "dark"
                  ? "bg-green-700 hover:bg-green-800 text-white disabled:bg-gray-700 disabled:text-gray-400"
                  : "bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:text-gray-600"
              )}
            >
              {testingConnection ? "Testing..." : "Test Connection"}
            </button>
          </div>
        </div>
        <textarea
          value={protoContent}
          onChange={(e) => setProtoContent(e.target.value)}
          placeholder="Paste your .proto file content here..."
          rows={8}
          className={clsx(
            "w-full p-3 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 font-mono",
            theme === "dark"
              ? "bg-[#10121b] text-white border-gray-600 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400"
              : "bg-white text-gray-800 border-gray-300 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500"
          )}
        />
      </div>

      {/* Service and Method Selection */}
      {services.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className={clsx(
                "block text-sm mb-2",
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              )}
            >
              Service
            </label>
            <select
              value={grpcService}
              onChange={(e) => setGrpcService(e.target.value)}
              className={clsx(
                "w-full p-2 border rounded text-sm",
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-800"
              )}
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.name} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className={clsx(
                "block text-sm mb-2",
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              )}
            >
              Method
            </label>
            <select
              value={grpcMethod}
              onChange={(e) => setGrpcMethod(e.target.value)}
              disabled={!grpcService}
              className={clsx(
                "w-full p-2 border rounded text-sm",
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-400"
                  : "bg-white border-gray-300 text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
              )}
            >
              <option value="">Select a method</option>
              {methods.map((method) => (
                <option key={method.name} value={method.name}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Call Type Selection */}
      <div>
        <label
          className={clsx(
            "block text-sm mb-2",
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          )}
        >
          Call Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              "unary",
              "server_streaming",
              "client_streaming",
              "bidirectional",
            ] as const
          ).map((type) => (
            <label
              key={type}
              className={clsx(
                "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                grpcCallType === type
                  ? theme === "dark"
                    ? "border-purple-500 bg-purple-900/20"
                    : "border-purple-500 bg-purple-50"
                  : theme === "dark"
                    ? "border-gray-600 hover:border-gray-500"
                    : "border-gray-300 hover:border-gray-400"
              )}
            >
              <input
                type="radio"
                name="callType"
                checked={grpcCallType === type}
                onChange={() => setGrpcCallType(type)}
                className={clsx(
                  "text-purple-600",
                  theme === "dark" ? "accent-purple-500" : "accent-purple-600"
                )}
              />
              <div>
                <div
                  className={clsx(
                    "text-sm font-medium",
                    theme === "dark" ? "text-gray-100" : "text-gray-900"
                  )}
                >
                  {getCallTypeLabel(type)}
                </div>
                <div
                  className={clsx(
                    "text-xs",
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  )}
                >
                  {getCallTypeDescription(type)}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Message Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            className={clsx(
              "block text-sm",
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            )}
          >
            Message (JSON)
            {grpcMessage.trim() && (
              <span className="ml-2 text-lg">{isJsonValid ? "✅" : "❌"}</span>
            )}
          </label>
          <button
            onClick={formatGrpcMessage}
            disabled={!isJsonValid}
            title="Format and prettify JSON message (Ctrl/Cmd + Shift + F)"
            className={clsx(
              "text-xs px-2 py-1 rounded font-medium cursor-pointer transition-colors",
              isJsonValid
                ? theme === "dark"
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-500 hover:text-gray-700"
                : "text-gray-600 cursor-not-allowed"
            )}
          >
            Format JSON
          </button>
        </div>
        <textarea
          value={grpcMessage}
          onChange={(e) => setGrpcMessage(e.target.value)}
          placeholder='{"id": "123", "name": "example"}'
          rows={6}
          className={clsx(
            "w-full p-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 font-mono",
            !isJsonValid && grpcMessage.trim()
              ? theme === "dark"
                ? "border-2 border-red-500 bg-[#10121b] text-white focus:ring-red-500"
                : "border-2 border-red-500 bg-white text-gray-800 focus:ring-red-500"
              : theme === "dark"
                ? "border border-gray-600 bg-[#10121b] text-white focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400"
                : "border border-gray-300 bg-white text-gray-800 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500"
          )}
        />
        {jsonError && (
          <div
            className={clsx(
              "text-xs mt-2 p-2 rounded border",
              theme === "dark"
                ? "bg-red-900/20 border-red-700 text-red-300"
                : "bg-red-50 border-red-300 text-red-700"
            )}
          >
            ❌ {jsonError}
          </div>
        )}
      </div>

      {/* Method Info Display */}
      {grpcMethod && methods.length > 0 && (
        <div
          className={clsx(
            "p-3 rounded-lg border",
            theme === "dark"
              ? "bg-gray-800/30 border-gray-600"
              : "bg-gray-50 border-gray-300"
          )}
        >
          <div
            className={clsx(
              "text-sm font-medium mb-2",
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            )}
          >
            Method Information
          </div>
          {methods
            .filter((m) => m.name === grpcMethod)
            .map((method) => (
              <div key={method.name} className="text-xs space-y-1">
                <div>
                  <span
                    className={clsx(
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    )}
                  >
                    Input Type:
                  </span>{" "}
                  <span
                    className={clsx(
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    )}
                  >
                    {method.input_type}
                  </span>
                </div>
                <div>
                  <span
                    className={clsx(
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    )}
                  >
                    Output Type:
                  </span>{" "}
                  <span
                    className={clsx(
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    )}
                  >
                    {method.output_type}
                  </span>
                </div>
                <div>
                  <span
                    className={clsx(
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    )}
                  >
                    Streaming:
                  </span>{" "}
                  <span
                    className={clsx(
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    )}
                  >
                    {method.is_client_streaming || method.is_server_streaming
                      ? `${method.is_client_streaming ? "Client" : ""}${
                          method.is_client_streaming &&
                          method.is_server_streaming
                            ? " + "
                            : ""
                        }${method.is_server_streaming ? "Server" : ""}`
                      : "None"}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

import { useTheme } from "../context/ThemeContext";
import { useRequest } from "../context/RequestContext";
import clsx from "clsx";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

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
    setGrpcService,
    setGrpcMethod,
    setGrpcMessage,
    setGrpcCallType,
    setProtoContent,
  } = useRequest();

  const [services, setServices] = useState<ProtoService[]>([]);
  const [methods, setMethods] = useState<ProtoMethod[]>([]);
  const [discoveredServices, setDiscoveredServices] = useState<ProtoService[]>(
    []
  );
  const [isDiscovering, setIsDiscovering] = useState(false);

  // Parse proto content when it changes
  useEffect(() => {
    if (protoContent.trim()) {
      parseProtoContent();
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

  const parseProtoContent = async () => {
    try {
      const result = (await invoke("grpc_parse_proto_file", {
        content: protoContent,
      })) as any;

      if (result.success && result.data) {
        const schema = result.data as ProtoSchema;
        setServices(schema.services);
        setDiscoveredServices(schema.services);
      }
    } catch (error) {
      console.error("Failed to parse proto file:", error);
    }
  };

  const discoverServices = async () => {
    // This would be called when user wants to discover services from a server
    setIsDiscovering(true);
    try {
      // For now, we'll use the parsed services
      // In a real implementation, this would call the reflection API
      setServices(discoveredServices);
    } catch (error) {
      console.error("Failed to discover services:", error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const formatGrpcMessage = () => {
    try {
      const sanitized = grpcMessage.replace(/[""]/g, '"').replace(/['']/g, "'");
      const parsed = JSON.parse(sanitized);
      setGrpcMessage(JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.error("Invalid JSON");
      alert("Invalid JSON format. Please correct it before formatting.");
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
        <div className="flex gap-2 mb-2">
          <button
            onClick={parseProtoContent}
            disabled={!protoContent.trim()}
            className={clsx(
              "px-3 py-1 text-xs rounded font-medium",
              theme === "dark"
                ? "bg-purple-700 hover:bg-purple-800 text-white disabled:bg-gray-700 disabled:text-gray-400"
                : "bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-400 disabled:text-gray-600"
            )}
          >
            Parse Proto
          </button>
          <button
            onClick={discoverServices}
            disabled={isDiscovering}
            className={clsx(
              "px-3 py-1 text-xs rounded font-medium",
              theme === "dark"
                ? "bg-blue-700 hover:bg-blue-800 text-white disabled:bg-gray-700 disabled:text-gray-400"
                : "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:text-gray-600"
            )}
          >
            {isDiscovering ? "Discovering..." : "Discover Services"}
          </button>
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
                className="text-purple-600"
              />
              <div>
                <div className="text-sm font-medium">
                  {getCallTypeLabel(type)}
                </div>
                <div className="text-xs text-gray-500">
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
          </label>
          <button
            onClick={formatGrpcMessage}
            className={clsx(
              "text-xs px-2 py-1 rounded font-medium cursor-pointer",
              theme === "dark" ? "text-gray-600" : "text-gray-500"
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
            "w-full p-3 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 font-mono",
            theme === "dark"
              ? "bg-[#10121b] text-white border-gray-600 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400"
              : "bg-white text-gray-800 border-gray-300 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500"
          )}
        />
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
          <div className="text-sm font-medium mb-2">Method Information</div>
          {methods
            .filter((m) => m.name === grpcMethod)
            .map((method) => (
              <div key={method.name} className="text-xs space-y-1">
                <div>
                  <span className="text-gray-500">Input Type:</span>{" "}
                  {method.input_type}
                </div>
                <div>
                  <span className="text-gray-500">Output Type:</span>{" "}
                  {method.output_type}
                </div>
                <div>
                  <span className="text-gray-500">Streaming:</span>{" "}
                  {method.is_client_streaming || method.is_server_streaming
                    ? `${method.is_client_streaming ? "Client" : ""}${
                        method.is_client_streaming && method.is_server_streaming
                          ? " + "
                          : ""
                      }${method.is_server_streaming ? "Server" : ""}`
                    : "None"}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

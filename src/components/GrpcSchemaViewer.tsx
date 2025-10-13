import { useTheme } from "../context/ThemeContext";
import { useState } from "react";
import clsx from "clsx";

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

interface GrpcSchemaViewerProps {
  services: ProtoService[];
  messages: ProtoMessage[];
}

export const GrpcSchemaViewer = ({
  services,
  messages,
}: GrpcSchemaViewerProps) => {
  const { theme } = useTheme();
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
    new Set()
  );
  const [expandedServices, setExpandedServices] = useState<Set<string>>(
    new Set()
  );

  const toggleMessage = (messageName: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageName)) {
      newExpanded.delete(messageName);
    } else {
      newExpanded.add(messageName);
    }
    setExpandedMessages(newExpanded);
  };

  const toggleService = (serviceName: string) => {
    const newExpanded = new Set(expandedServices);
    if (newExpanded.has(serviceName)) {
      newExpanded.delete(serviceName);
    } else {
      newExpanded.add(serviceName);
    }
    setExpandedServices(newExpanded);
  };

  const getTypeColor = (type: string) => {
    if (type.includes("string")) return "text-green-500";
    if (
      type.includes("int") ||
      type.includes("float") ||
      type.includes("double")
    )
      return "text-blue-500";
    if (type.includes("bool")) return "text-purple-500";
    return theme === "dark" ? "text-yellow-400" : "text-yellow-600";
  };

  const getStreamingBadge = (method: ProtoMethod) => {
    if (method.is_client_streaming && method.is_server_streaming) {
      return (
        <span
          className={clsx(
            "ml-2 px-2 py-0.5 text-xs rounded font-medium",
            theme === "dark"
              ? "bg-purple-900/50 text-purple-300"
              : "bg-purple-100 text-purple-800"
          )}
        >
          Bidirectional
        </span>
      );
    }
    if (method.is_server_streaming) {
      return (
        <span
          className={clsx(
            "ml-2 px-2 py-0.5 text-xs rounded font-medium",
            theme === "dark"
              ? "bg-blue-900/50 text-blue-300"
              : "bg-blue-100 text-blue-800"
          )}
        >
          Server Stream
        </span>
      );
    }
    if (method.is_client_streaming) {
      return (
        <span
          className={clsx(
            "ml-2 px-2 py-0.5 text-xs rounded font-medium",
            theme === "dark"
              ? "bg-green-900/50 text-green-300"
              : "bg-green-100 text-green-800"
          )}
        >
          Client Stream
        </span>
      );
    }
    return (
      <span
        className={clsx(
          "ml-2 px-2 py-0.5 text-xs rounded font-medium",
          theme === "dark"
            ? "bg-gray-700 text-gray-300"
            : "bg-gray-200 text-gray-700"
        )}
      >
        Unary
      </span>
    );
  };

  if (services.length === 0 && messages.length === 0) {
    return (
      <div
        className={clsx(
          "p-8 text-center rounded-xl border",
          theme === "dark"
            ? "bg-gray-800/30 border-gray-600 text-gray-400"
            : "bg-gray-50 border-gray-300 text-gray-600"
        )}
      >
        <p>
          No schema available. Parse a proto file or discover services first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Services Section */}
      {services.length > 0 && (
        <div>
          <h3
            className={clsx(
              "text-lg font-semibold mb-3",
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            )}
          >
            Services ({services.length})
          </h3>
          <div className="space-y-2">
            {services.map((service) => (
              <div
                key={service.name}
                className={clsx(
                  "border rounded-lg overflow-hidden",
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                )}
              >
                <button
                  onClick={() => toggleService(service.name)}
                  className={clsx(
                    "w-full px-4 py-3 text-left font-medium flex items-center justify-between transition-colors",
                    theme === "dark"
                      ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  )}
                >
                  <span className="font-mono">{service.name}</span>
                  <span className="text-xs">
                    {expandedServices.has(service.name) ? "▼" : "▶"}
                  </span>
                </button>
                {expandedServices.has(service.name) && (
                  <div
                    className={clsx(
                      "px-4 py-3 space-y-2",
                      theme === "dark" ? "bg-gray-900/50" : "bg-white"
                    )}
                  >
                    {service.methods.map((method) => (
                      <div
                        key={method.name}
                        className={clsx(
                          "p-3 rounded border",
                          theme === "dark"
                            ? "border-gray-700 bg-gray-800/50"
                            : "border-gray-200 bg-gray-50"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={clsx(
                              "font-mono font-medium",
                              theme === "dark"
                                ? "text-purple-300"
                                : "text-purple-700"
                            )}
                          >
                            {method.name}()
                          </span>
                          {getStreamingBadge(method)}
                        </div>
                        <div
                          className={clsx(
                            "text-xs space-y-1 font-mono",
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          )}
                        >
                          <div>
                            <span className="opacity-70">Input: </span>
                            <span
                              className={clsx(
                                theme === "dark"
                                  ? "text-blue-300"
                                  : "text-blue-700"
                              )}
                            >
                              {method.input_type}
                            </span>
                          </div>
                          <div>
                            <span className="opacity-70">Output: </span>
                            <span
                              className={clsx(
                                theme === "dark"
                                  ? "text-green-300"
                                  : "text-green-700"
                              )}
                            >
                              {method.output_type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Section */}
      {messages.length > 0 && (
        <div>
          <h3
            className={clsx(
              "text-lg font-semibold mb-3",
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            )}
          >
            Messages ({messages.length})
          </h3>
          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.name}
                className={clsx(
                  "border rounded-lg overflow-hidden",
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                )}
              >
                <button
                  onClick={() => toggleMessage(message.name)}
                  className={clsx(
                    "w-full px-4 py-3 text-left font-medium flex items-center justify-between transition-colors",
                    theme === "dark"
                      ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  )}
                >
                  <span className="font-mono">{message.name}</span>
                  <span className="text-xs">
                    {expandedMessages.has(message.name) ? "▼" : "▶"}
                  </span>
                </button>
                {expandedMessages.has(message.name) && (
                  <div
                    className={clsx(
                      "px-4 py-3",
                      theme === "dark" ? "bg-gray-900/50" : "bg-white"
                    )}
                  >
                    {message.fields.length === 0 ? (
                      <p
                        className={clsx(
                          "text-xs italic",
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        )}
                      >
                        No fields
                      </p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr
                            className={clsx(
                              "border-b",
                              theme === "dark"
                                ? "border-gray-700 text-gray-400"
                                : "border-gray-200 text-gray-600"
                            )}
                          >
                            <th className="text-left py-2 px-2 font-medium">
                              Field
                            </th>
                            <th className="text-left py-2 px-2 font-medium">
                              Type
                            </th>
                            <th className="text-center py-2 px-2 font-medium">
                              #
                            </th>
                            <th className="text-center py-2 px-2 font-medium">
                              Modifier
                            </th>
                          </tr>
                        </thead>
                        <tbody className="font-mono">
                          {message.fields.map((field) => (
                            <tr
                              key={field.number}
                              className={clsx(
                                "border-b",
                                theme === "dark"
                                  ? "border-gray-800"
                                  : "border-gray-100"
                              )}
                            >
                              <td
                                className={clsx(
                                  "py-2 px-2",
                                  theme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-700"
                                )}
                              >
                                {field.name}
                              </td>
                              <td
                                className={clsx(
                                  "py-2 px-2",
                                  getTypeColor(field.field_type)
                                )}
                              >
                                {field.field_type}
                              </td>
                              <td
                                className={clsx(
                                  "py-2 px-2 text-center",
                                  theme === "dark"
                                    ? "text-gray-500"
                                    : "text-gray-400"
                                )}
                              >
                                {field.number}
                              </td>
                              <td className="py-2 px-2 text-center">
                                {field.repeated && (
                                  <span
                                    className={clsx(
                                      "px-2 py-0.5 text-xs rounded font-medium",
                                      theme === "dark"
                                        ? "bg-orange-900/50 text-orange-300"
                                        : "bg-orange-100 text-orange-800"
                                    )}
                                  >
                                    repeated
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

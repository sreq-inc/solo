import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useRequest } from "../context/RequestContext";
import {
  useIntrospection,
  GraphQLType,
  GraphQLTypeRef,
} from "../hooks/useIntrospection";
import {
  ChevronDown,
  ChevronRight,
  Type,
  Database,
  Zap,
  RefreshCw,
} from "lucide-react";
import clsx from "clsx";

const TypeExplorer = ({ type }: { type: GraphQLType }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const renderTypeRef = (typeRef: GraphQLTypeRef): string => {
    if (typeRef.ofType) {
      switch (typeRef.kind) {
        case "NON_NULL":
          return renderTypeRef(typeRef.ofType) + "!";
        case "LIST":
          return "[" + renderTypeRef(typeRef.ofType) + "]";
        default:
          return typeRef.name || "Unknown";
      }
    }
    return typeRef.name || "Unknown";
  };

  const getTypeIcon = (kind: string) => {
    const iconClass = clsx(
      "w-4 h-4",
      theme === "dark" ? "text-gray-300" : "text-gray-600"
    );

    switch (kind) {
      case "OBJECT":
        return <Type className={iconClass} />;
      case "SCALAR":
        return <Database className={iconClass} />;
      case "ENUM":
        return <Zap className={iconClass} />;
      default:
        return <Type className={iconClass} />;
    }
  };

  if (type.kind === "SCALAR" || type.kind === "ENUM") {
    return (
      <div
        className={clsx(
          "p-3 border rounded-lg",
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-gray-50 border-gray-200"
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          {getTypeIcon(type.kind)}
          <span
            className={clsx(
              "font-medium",
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            )}
          >
            {type.name}
          </span>
          <span
            className={clsx(
              "text-xs px-2 py-1 rounded font-medium",
              theme === "dark"
                ? "bg-gray-700 text-gray-200"
                : "bg-gray-200 text-gray-700"
            )}
          >
            {type.kind}
          </span>
        </div>
        {type.description && (
          <p
            className={clsx(
              "text-sm mb-2",
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            )}
          >
            {type.description}
          </p>
        )}
        {type.enumValues && (
          <div>
            <div
              className={clsx(
                "font-medium mb-2 text-sm",
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              )}
            >
              Values:
            </div>
            <div className="space-y-1">
              {type.enumValues.map((enumValue) => (
                <div
                  key={enumValue.name}
                  className="flex items-center gap-2 flex-wrap"
                >
                  <code
                    className={clsx(
                      "px-2 py-1 rounded text-xs font-medium",
                      theme === "dark"
                        ? "bg-gray-700 text-green-300"
                        : "bg-gray-200 text-green-700"
                    )}
                  >
                    {enumValue.name}
                  </code>
                  {enumValue.description && (
                    <span
                      className={clsx(
                        "text-xs leading-relaxed",
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      )}
                    >
                      {enumValue.description}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "border rounded-lg",
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-gray-50 border-gray-200"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={clsx(
          "w-full p-3 flex items-center gap-2 text-left transition-colors cursor-pointer",
          theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
        )}
      >
        {expanded ? (
          <ChevronDown
            className={clsx(
              "w-4 h-4",
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            )}
          />
        ) : (
          <ChevronRight
            className={clsx(
              "w-4 h-4",
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            )}
          />
        )}
        {getTypeIcon(type.kind)}
        <span
          className={clsx(
            "font-medium",
            theme === "dark" ? "text-gray-100" : "text-gray-900"
          )}
        >
          {type.name}
        </span>
        <span
          className={clsx(
            "text-xs px-2 py-1 rounded ml-auto font-medium",
            theme === "dark"
              ? "bg-gray-700 text-gray-200"
              : "bg-gray-200 text-gray-700"
          )}
        >
          {type.kind}
        </span>
      </button>

      {expanded && (
        <div className="px-3 pb-3">
          {type.description && (
            <p
              className={clsx(
                "text-sm mb-3",
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              )}
            >
              {type.description}
            </p>
          )}

          {type.fields && type.fields.length > 0 && (
            <div>
              <div
                className={clsx(
                  "font-medium my-2 text-sm",
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                )}
              >
                Fields:
              </div>
              <div className="space-y-2">
                {type.fields.map((field) => (
                  <div
                    key={field.name}
                    className={clsx(
                      "p-2 rounded",
                      theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <code
                        className={clsx(
                          "font-medium text-sm",
                          theme === "dark" ? "text-blue-300" : "text-blue-700"
                        )}
                      >
                        {field.name}
                      </code>
                      <span
                        className={clsx(
                          "text-sm",
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        )}
                      >
                        :
                      </span>
                      <code
                        className={clsx(
                          "text-sm",
                          theme === "dark" ? "text-green-300" : "text-green-700"
                        )}
                      >
                        {renderTypeRef(field.type)}
                      </code>
                    </div>
                    {field.description && (
                      <p
                        className={clsx(
                          "text-xs mt-1 leading-relaxed",
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        )}
                      >
                        {field.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const SchemaViewer = () => {
  const { theme } = useTheme();
  const { url, useBasicAuth, username, password, bearerToken } = useRequest();
  const {
    schema,
    loading,
    error,
    runIntrospection,
    clearSchema,
    getQueryType,
    getMutationType,
    getSubscriptionType,
  } = useIntrospection();

  const [activeTab, setActiveTab] = useState<
    "queries" | "mutations" | "subscriptions" | "types"
  >("queries");

  const handleRunIntrospection = () => {
    runIntrospection(url, useBasicAuth, username, password, bearerToken);
  };

  if (loading) {
    return (
      <div
        className={clsx(
          "p-4 text-center",
          theme === "dark" ? "text-gray-300" : "text-gray-600"
        )}
      >
        <RefreshCw
          className={clsx(
            "w-6 h-6 animate-spin mx-auto mb-2",
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          )}
        />
        Running introspection...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={clsx(
          "p-4 rounded-lg",
          theme === "dark"
            ? "bg-red-900 text-red-300"
            : "bg-red-100 text-red-800"
        )}
      >
        <div className="font-medium mb-2">Introspection Error</div>
        <div className="text-sm mb-3">{error}</div>
        <button
          onClick={handleRunIntrospection}
          className={clsx(
            "px-3 py-1 rounded text-sm transition-colors",
            theme === "dark"
              ? "bg-red-800 hover:bg-red-700 text-red-200"
              : "bg-red-200 hover:bg-red-300 text-red-800"
          )}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!schema) {
    return (
      <div
        className={clsx(
          "p-8 text-center",
          theme === "dark" ? "text-gray-300" : "text-gray-600"
        )}
      >
        <Database
          className={clsx(
            "w-12 h-12 mx-auto mb-4 opacity-50",
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          )}
        />
        <h3 className="font-medium mb-2">No Schema Loaded</h3>
        <p className="text-sm mb-4">
          Run introspection to explore the GraphQL schema
        </p>
        <button
          onClick={handleRunIntrospection}
          className={clsx(
            "px-4 py-2 rounded text-sm font-medium transition-colors",
            theme === "dark"
              ? "bg-purple-700 hover:bg-purple-800 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          )}
        >
          Run Introspection
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <button
          onClick={handleRunIntrospection}
          className={clsx(
            "px-3 py-1 rounded text-sm transition-colors cursor-pointer",
            theme === "dark"
              ? "bg-purple-700 hover:bg-purple-800 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          )}
        >
          Refresh Schema
        </button>
        <button
          onClick={clearSchema}
          className={clsx(
            "px-3 py-1 rounded text-sm transition-colors cursor-pointer",
            theme === "dark"
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          )}
        >
          Clear
        </button>
      </div>

      <div
        className={clsx(
          "flex gap-2 border-b mb-4 flex-shrink-0",
          theme === "dark" ? "border-gray-600" : "border-gray-300"
        )}
      >
        {(["queries", "mutations", "subscriptions", "types"] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "px-3 py-2 text-sm font-medium capitalize border-b-2 transition-colors",
                activeTab === tab
                  ? theme === "dark"
                    ? "border-purple-400 text-purple-300"
                    : "border-purple-600 text-purple-600"
                  : theme === "dark"
                    ? "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-400"
              )}
            >
              {tab}
            </button>
          )
        )}
      </div>

      <div
        className={clsx(
          "overflow-y-auto pr-2 h-[500px]",
          "scrollbar-thin scrollbar-track-transparent",
          theme === "dark"
            ? "scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500"
            : "scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
        )}
      >
        <div className="space-y-3">
          {activeTab === "queries" && (
            <div>
              {getQueryType() ? (
                <TypeExplorer type={getQueryType()!} />
              ) : (
                <div
                  className={clsx(
                    "p-4 text-center",
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  )}
                >
                  No query type found
                </div>
              )}
            </div>
          )}

          {activeTab === "mutations" && (
            <div>
              {getMutationType() ? (
                <TypeExplorer type={getMutationType()!} />
              ) : (
                <div
                  className={clsx(
                    "p-4 text-center",
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  )}
                >
                  No mutation type found
                </div>
              )}
            </div>
          )}

          {activeTab === "subscriptions" && (
            <div>
              {getSubscriptionType() ? (
                <TypeExplorer type={getSubscriptionType()!} />
              ) : (
                <div
                  className={clsx(
                    "p-4 text-center",
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  )}
                >
                  No subscription type found
                </div>
              )}
            </div>
          )}

          {activeTab === "types" && (
            <div className="space-y-3">
              {schema.types
                .filter((type) => !type.name.startsWith("__"))
                .map((type) => (
                  <TypeExplorer key={type.name} type={type} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { RequestType, Tab } from "../context/RequestContext";
import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";

type TabComponentProps = {
  activeTab: Tab;
  request: RequestType;
  onTabChange: (tab: Tab) => void;
};

export const TabComponent = ({
  activeTab,
  request,
  onTabChange,
}: TabComponentProps) => {
  const { theme } = useTheme();

  const getTabClasses = (isActive: boolean) => {
    return clsx(
      "py-2 px-4 text-sm font-medium cursor-pointer transition-all duration-200 whitespace-nowrap",
      isActive
        ? theme === "dark"
          ? "bg-purple-700 text-white shadow-md"
          : "bg-purple-600 text-white shadow-md"
        : theme === "dark"
        ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {request === "http" && (
        <button
          onClick={() => onTabChange("body")}
          className={getTabClasses(activeTab === "body")}
          title="Request body (JSON payload)"
        >
          Body
        </button>
      )}
      {request === "graphql" && (
        <>
          <button
            onClick={() => onTabChange("graphql")}
            className={getTabClasses(activeTab === "graphql")}
            title="GraphQL query and variables"
          >
            GraphQL
          </button>
          <button
            onClick={() => onTabChange("schema")}
            className={getTabClasses(activeTab === "schema")}
            title="View GraphQL schema"
          >
            Schema
          </button>
        </>
      )}
      {request === "grpc" && (
        <>
          <button
            onClick={() => onTabChange("grpc")}
            className={getTabClasses(activeTab === "grpc")}
            title="gRPC service and method"
          >
            gRPC
          </button>
          <button
            onClick={() => onTabChange("proto")}
            className={getTabClasses(activeTab === "proto")}
            title="Protocol Buffer definition"
          >
            Proto
          </button>
          <button
            onClick={() => onTabChange("metadata")}
            className={getTabClasses(activeTab === "metadata")}
            title="gRPC metadata (headers)"
          >
            Metadata
          </button>
          <button
            onClick={() => onTabChange("schema")}
            className={getTabClasses(activeTab === "schema")}
            title="View gRPC schema"
          >
            Schema
          </button>
        </>
      )}
      <button
        onClick={() => onTabChange("auth")}
        className={getTabClasses(activeTab === "auth")}
        title="Authentication settings"
      >
        Auth
      </button>
      {request === "http" && (
        <button
          onClick={() => onTabChange("params")}
          className={getTabClasses(activeTab === "params")}
          title="Query parameters"
        >
          Params
        </button>
      )}
      <button
        onClick={() => onTabChange("variables")}
        className={getTabClasses(activeTab === "variables")}
        title="Environment variables"
      >
        Variables
      </button>
      <button
        onClick={() => onTabChange("description")}
        className={getTabClasses(activeTab === "description")}
        title="Request documentation"
      >
        Docs
      </button>
    </div>
  );
};

import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useRequest } from "../context/RequestContext";
import clsx from "clsx";
import { ShortcutsDisplay } from "./ShortcutsDisplay";
import { useCurlGenerator } from "../hooks/useCurlGenerator";
import { CopyIcon } from "./CopyIcon";

type TabType = "response" | "headers" | "timeline";

interface TabItemProps {
  label: string;
  value: TabType;
  active: boolean;
  onClick: (tab: TabType) => void;
}

const TabItem = ({ label, value, active, onClick }: TabItemProps) => {
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
    <button
      onClick={() => onClick(value)}
      className={getTabClasses(active)}
    >
      {label}
    </button>
  );
};

export const ResponseView = () => {
  const { theme } = useTheme();
  const {
    response,
    error,
    loading,
    isCopied,
    handleCopyResponse,
    url,
  } = useRequest();

  const { generateCurl } = useCurlGenerator();
  const [activeTab, setActiveTab] = useState<TabType>("response");

  const lines = response ? JSON.stringify(response, null, 2).split("\n") : [];

  const headers = response
    ? [
      { key: "Content-Type", value: "application/json" },
      { key: "Server", value: "Tauri/1.0" },
      { key: "Date", value: new Date().toUTCString() },
      {
        key: "Content-Length",
        value: JSON.stringify(response).length.toString(),
      },
    ]
    : [];

  const timeline = response
    ? [
      {
        name: "Request Started",
        timestamp: new Date(Date.now() - 500).toISOString(),
      },
      {
        name: "Request Sent",
        timestamp: new Date(Date.now() - 400).toISOString(),
      },
      {
        name: "Response Received",
        timestamp: new Date(Date.now() - 100).toISOString(),
        duration: 300,
      },
      { name: "Response Parsed", timestamp: new Date().toISOString() },
    ]
    : [];

  const renderContent = () => {
    switch (activeTab) {
      case "response":
        return (
          <table className="w-full table-fixed">
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td
                    className={clsx(
                      "text-center select-none w-12 border-r sticky left-0",
                      theme === "dark"
                        ? "text-gray-500 border-gray-700 bg-gray-700"
                        : "text-gray-500 border-gray-300 bg-gray-100"
                    )}
                  >
                    1
                  </td>
                  <td
                    className={clsx(
                      "pl-4",
                      theme === "dark" ? "text-gray-300" : "text-gray-800"
                    )}
                  >
                    Loading...
                  </td>
                </tr>
              ) : !response ? (
                <ShortcutsDisplay />
              ) : (
                lines.map((line, i) => (
                  <tr
                    key={i}
                    className={clsx(
                      theme === "dark"
                        ? "hover:bg-gray-800"
                        : "hover:bg-gray-200"
                    )}
                  >
                    <td
                      className={clsx(
                        "text-center select-none w-12 border-r sticky left-0",
                        theme === "dark"
                          ? "text-gray-500 border-gray-700 bg-gray-900"
                          : "text-gray-500 border-gray-300 bg-gray-100"
                      )}
                    >
                      {i + 1}
                    </td>
                    <td
                      className={clsx(
                        "pl-4 whitespace-pre-wrap break-words",
                        theme === "dark" ? "text-gray-300" : "text-gray-800"
                      )}
                    >
                      {line}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        );

      case "headers":
        return (
          <div
            className={clsx(
              "p-4",
              theme === "dark" ? "text-gray-300" : "text-gray-800"
            )}
          >
            {headers.length > 0 ? (
              <div className="space-y-2">
                {headers.map((header, index) => (
                  <div key={index} className="flex">
                    <span
                      className={clsx(
                        "font-medium mr-2",
                        theme === "dark" ? "text-purple-300" : "text-purple-700"
                      )}
                    >
                      {header.key}:
                    </span>
                    <span className="break-all">{header.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
              >
                No headers available
              </div>
            )}
          </div>
        );

      case "timeline":
        return (
          <div
            className={clsx(
              "p-4",
              theme === "dark" ? "text-gray-300" : "text-gray-800"
            )}
          >
            {timeline.length > 0 ? (
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div
                    key={index}
                    className="border-l-2 pl-4 pb-4 relative border-gray-400 last:pb-0"
                  >
                    <div className="absolute w-3 h-3 rounded-full -left-[7px] bg-purple-500"></div>
                    <div className="flex flex-col">
                      <span
                        className={clsx(
                          "font-medium",
                          theme === "dark"
                            ? "text-purple-300"
                            : "text-purple-700"
                        )}
                      >
                        {event.name}
                      </span>
                      <span
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                      {event.duration && (
                        <span
                          className={
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }
                        >
                          Duration: {event.duration}ms
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
              >
                No timeline data available
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="p-4 space-y-4 col-span-5 h-full w-full">
      {error && (
        <div
          className={clsx(
            "p-2 rounded",
            theme === "dark"
              ? "bg-red-900 text-red-300"
              : "bg-red-100 text-red-800"
          )}
        >
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <TabItem
            label="Response"
            value="response"
            active={activeTab === "response"}
            onClick={setActiveTab}
          />
          <TabItem
            label="Headers"
            value="headers"
            active={activeTab === "headers"}
            onClick={setActiveTab}
          />
          <TabItem
            label="Timeline"
            value="timeline"
            active={activeTab === "timeline"}
            onClick={setActiveTab}
          />
        </div>

        {url && (
          <div className="ml-auto">
            <CopyIcon
              content={generateCurl()}
              size={16}
              className="mr-2"
            />
          </div>
        )}
      </div>

      <div
        className={clsx(
          "relative max-h-[600px] overflow-auto font-mono border rounded-xl pb-8",
          theme === "dark"
            ? response
              ? "bg-[#10121b] border-gray-600"
              : "bg-transparent border-transparent"
            : response
              ? "bg-gray-100 border-gray-300"
              : "bg-transparent border-transparent"
        )}
      >
        {renderContent()}
      </div>

      {response && activeTab === "response" && (
        <button
          onClick={handleCopyResponse}
          disabled={isCopied}
          className={clsx(
            "w-full p-2 rounded cursor-pointer",
            theme === "dark"
              ? "bg-purple-900 text-purple-300 hover:bg-purple-800"
              : "bg-purple-200 text-purple-800 hover:bg-purple-300",
            isCopied && "opacity-50 cursor-not-allowed"
          )}
        >
          {isCopied ? "Copied!" : "Copy Response"}
        </button>
      )}
    </div>
  );
};

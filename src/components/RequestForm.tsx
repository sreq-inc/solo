import { SelectMethod } from "./SelectMethod";
import { TabComponent } from "./TabComponent";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useRequest } from "../context/RequestContext";
import clsx from "clsx";
import { SelectAuth } from "./SelectAuth";
import { UsernameAndPassword } from "./UsernameAndPassword";
import { BearerToken } from "./BearerToken";

export const RequestForm = () => {
  const { theme } = useTheme();
  const {
    method,
    url,
    payload,
    loading,
    username,
    password,
    useBasicAuth,
    activeTab,
    bearerToken,
    setMethod,
    setUrl,
    setPayload,
    setUsername,
    setPassword,
    setUseBasicAuth,
    setActiveTab,
    setBearerToken,
    handleRequest,
    formatJson,
  } = useRequest();

  const options = [
    { label: "Basic Auth", value: "basic" },
    { label: "Bearer Token", value: "bearer" },
  ];

  const [showPassword, setShowPassword] = useState(false);
  const [selectAuth, setSelectAuth] = useState(options[0].value);

  return (
    <div className="p-4 space-y-4 col-span-5 h-full">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-20 mr-2">
          <SelectMethod
            value={method}
            options={["GET", "POST", "PUT", "DELETE", "PATCH"]}
            onChange={(value) =>
              setMethod(value as "GET" | "POST" | "PUT" | "DELETE" | "PATCH")
            }
          />
        </div>
        <div className="flex-grow">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className={clsx(
              "w-full p-2 border rounded",
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-800",
            )}
          />
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={handleRequest}
            disabled={loading}
            className={clsx(
              "p-2 text-white rounded",
              theme === "dark"
                ? "bg-purple-700 hover:bg-purple-800"
                : "bg-purple-600 hover:bg-purple-700",
              loading && "opacity-50 cursor-not-allowed",
            )}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
      <TabComponent activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "body" && (
        <div className="mt-4">
          <label
            className={clsx(
              "block text-sm mb-2",
              theme === "dark" ? "text-gray-300" : "text-gray-700",
            )}
          >
            JSON Payload (optional)
          </label>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder='{"key": "value"}'
            className={clsx(
              "w-full p-2 border rounded h-96",
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-800",
            )}
          />
          <button
            onClick={formatJson}
            className={clsx(
              "mt-2 py-2 rounded text-xs font-semibold cursor-pointer",
              theme === "dark" ? "text-gray-600" : "text-gray-500",
            )}
          >
            Format JSON
          </button>
        </div>
      )}
      {activeTab === "auth" && (
        <div
          className={clsx(
            "mt-4 p-4 border rounded",
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-300",
          )}
        >
          <div className="mb-8">
            <SelectAuth
              value={selectAuth}
              options={options}
              onChange={(value) => setSelectAuth(value)}
            />
          </div>
          {selectAuth === "basic" && (
            <UsernameAndPassword
              username={username}
              password={password}
              useBasicAuth={useBasicAuth}
              onUsernameChange={setUsername}
              onPasswordChange={setPassword}
              onUseBasicAuthChange={setUseBasicAuth}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          )}
          {selectAuth === "bearer" && (
            <BearerToken
              bearerToken={bearerToken}
              onTokenChange={setBearerToken}
            />
          )}
        </div>
      )}
    </div>
  );
};

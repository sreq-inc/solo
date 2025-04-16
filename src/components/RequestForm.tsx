import { SelectMethod } from "./SelectMethod";
import { TabComponent } from "./TabComponent";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";
import { SelectAuth } from "./SelectAuth";
import { UsernameAndPassword } from "./UsernameAndPassword";
import { BearerToken } from "./BearerToken";

type RequestFormProps = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  payload: string;
  loading: boolean;
  username: string;
  password: string;
  useBasicAuth: boolean;
  activeTab: "body" | "auth";
  onMethodChange: (method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH") => void;
  onUrlChange: (url: string) => void;
  onPayloadChange: (payload: string) => void;
  onUsernameChange: (username: string) => void;
  onPasswordChange: (password: string) => void;
  onUseBasicAuthChange: (useBasicAuth: boolean) => void;
  onTabChange: (tab: "body" | "auth") => void;
  onSendRequest: () => void;
};

export const RequestForm = ({
  method,
  url,
  payload,
  loading,
  username,
  password,
  useBasicAuth,
  activeTab,
  onMethodChange,
  onUrlChange,
  onPayloadChange,
  onUsernameChange,
  onPasswordChange,
  onUseBasicAuthChange,
  onTabChange,
  onSendRequest,
}: RequestFormProps) => {
  const { theme } = useTheme();
  const options = [
    { label: "Basic Auth", value: "basic" },
    { label: "Bearer Token", value: "bearer" },
    { label: "OAuth 2.0", value: "oauth2" },
  ];
  const [showPassword, setShowPassword] = useState(false);
  const [selectAuth, setSelectAuth] = useState(options[0].value);
  const [beearToken, setBearerToken] = useState("");

  return (
    <div className="p-4 space-y-4 col-span-5 h-full">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-20 mr-2">
          <SelectMethod
            value={method}
            options={["GET", "POST", "PUT", "DELETE", "PATCH"]}
            onChange={(value) =>
              onMethodChange(
                value as "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
              )
            }
          />
        </div>
        <div className="flex-grow">
          <input
            type="text"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
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
            onClick={onSendRequest}
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
      <TabComponent activeTab={activeTab} onTabChange={onTabChange} />
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
            onChange={(e) => onPayloadChange(e.target.value)}
            placeholder='{"key": "value"}'
            className={clsx(
              "w-full p-2 border rounded h-32",
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-800",
            )}
          />
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
              onUsernameChange={onUsernameChange}
              onPasswordChange={onPasswordChange}
              onUseBasicAuthChange={onUseBasicAuthChange}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          )}
          {selectAuth === "bearer" && (
            <BearerToken
              bearerToken={beearToken}
              onTokenChange={setBearerToken}
            />
          )}
        </div>
      )}
    </div>
  );
};

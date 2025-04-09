import { SelectMethod } from "./SelectMethod";
import { TabComponent } from "./TabComponent";

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
  return (
    <div className="p-4 space-y-4 col-span-5 h-full">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-20 mr-2">
          <SelectMethod
            value={method}
            options={["GET", "POST", "PUT", "DELETE", "PATCH"]}
            onChange={(value) =>
              onMethodChange(
                value as "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
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
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={onSendRequest}
            disabled={loading}
            className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>

      <TabComponent activeTab={activeTab} onTabChange={onTabChange} />

      {activeTab === "body" && (
        <div className="mt-4">
          <label className="block text-sm mb-2 dark:text-gray-200">
            JSON Payload (optional)
          </label>
          <textarea
            value={payload}
            onChange={(e) => onPayloadChange(e.target.value)}
            placeholder='{"key": "value"}'
            className="w-full p-2 border rounded h-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
          />
        </div>
      )}

      {activeTab === "auth" && (
        <div className="mt-4 p-4 border rounded dark:border-gray-600">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="useBasicAuth"
              checked={useBasicAuth}
              onChange={(e) => onUseBasicAuthChange(e.target.checked)}
              className="mr-2"
            />
            <label
              htmlFor="useBasicAuth"
              className="text-sm font-medium dark:text-gray-200"
            >
              Use Basic Authentication
            </label>
          </div>

          {useBasicAuth && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 dark:text-gray-200">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => onUsernameChange(e.target.value)}
                  placeholder="Username"
                  className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 dark:text-gray-200">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  placeholder="Password"
                  className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

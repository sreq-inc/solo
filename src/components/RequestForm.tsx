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
    payload,
    username,
    password,
    useBasicAuth,
    activeTab,
    bearerToken,
    setPayload,
    setUsername,
    setPassword,
    setUseBasicAuth,
    setActiveTab,
    setBearerToken,
    formatJson,
  } = useRequest();

  const options = [
    { label: "Basic Auth", value: "basic" },
    { label: "Bearer Token", value: "bearer" },
  ];

  const [showPassword, setShowPassword] = useState(false);
  const [selectAuth, setSelectAuth] = useState(options[0].value);

  const lines = payload.split("\n");

  return (
    <>
      <div className="p-4 space-y-4 col-span-5 h-full w-full">
        <TabComponent activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === "body" && (
          <div className="mt-4">
            <label
              className={clsx(
                "block text-sm mb-2",
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              )}
            >
              JSON Payload (optional)
            </label>
            <div
              className={clsx(
                "border rounded-xl min-h-[492px]  max-h-[492px] overflow-hidden",
                theme === "dark"
                  ? "bg-[#10121b] border-gray-600"
                  : "bg-white border-gray-300"
              )}
            >
              <div className="flex h-full">
                <div
                  className={clsx(
                    "select-none border-r w-12 flex flex-col text-right text-xs overflow-y-auto",
                    theme === "dark"
                      ? "border-gray-700 bg-gray-900 text-gray-500"
                      : "border-gray-300 bg-gray-100 text-gray-500"
                  )}
                >
                  {lines.map((_, index) => (
                    <div
                      key={index}
                      className="leading-6 min-h-[24px] text-center text-sm"
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  placeholder='{"key": "value"}'
                  className={clsx(
                    "flex-1 px-4 pb-4 text-xs focus:outline-0 ring-0 resize-none border-0 bg-transparent leading-6 overflow-y-auto",
                    theme === "dark" ? "text-white" : "text-gray-800"
                  )}
                  style={{ lineHeight: "24px" }}
                />
              </div>
            </div>
            <button
              onClick={formatJson}
              className={clsx(
                "mt-2 py-2 rounded text-xs font-semibold cursor-pointer",
                theme === "dark" ? "text-gray-600" : "text-gray-500"
              )}
            >
              Format JSON
            </button>
          </div>
        )}
        {activeTab === "auth" && (
          <div
            className={clsx(
              "mt-4 p-4 border rounded-xl",
              theme === "dark"
                ? "bg-[#10121b] border-gray-700"
                : "bg-white border-gray-300"
            )}
          >
            <div className="mb-8 mt-4">
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
    </>
  );
};

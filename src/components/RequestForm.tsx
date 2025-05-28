import { TabComponent } from "./TabComponent";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { useRequest } from "../context/RequestContext";
import clsx from "clsx";
import { SelectAuth } from "./SelectAuth";
import { UsernameAndPassword } from "./UsernameAndPassword";
import { BearerToken } from "./BearerToken";
import { Trash2Icon } from "lucide-react";

interface QueryParam {
  key: string;
  value: string;
  enabled: boolean;
}

export const RequestForm = () => {
  const { theme } = useTheme();
  const {
    payload,
    username,
    password,
    useBasicAuth,
    activeTab,
    bearerToken,
    url,
    setPayload,
    setUsername,
    setPassword,
    setUseBasicAuth,
    setActiveTab,
    setBearerToken,
    formatJson,
    setUrl,
  } = useRequest();

  const options = [
    { label: "Basic Auth", value: "basic" },
    { label: "Bearer Token", value: "bearer" },
  ];

  const [showPassword, setShowPassword] = useState(false);
  const [selectAuth, setSelectAuth] = useState(options[0].value);
  const [queryParams, setQueryParams] = useState<QueryParam[]>([
    { key: "", value: "", enabled: true },
  ]);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const urlParams = new URLSearchParams(url.split("?")[1]);
    const params: QueryParam[] = [];
    urlParams.forEach((value, key) => {
      params.push({ key, value, enabled: true });
    });
    if (params.length > 0) {
      setQueryParams(params);
    }
  }, [url]);

  const lines = payload.split("\n");

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: "", value: "", enabled: true }]);
  };

  const removeQueryParam = (index: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== index));
  };

  const updateQueryParam = (
    index: number,
    field: keyof QueryParam,
    value: string | boolean
  ) => {
    const updated = queryParams.map((param, i) =>
      i === index ? { ...param, [field]: value } : param
    );
    setQueryParams(updated);
    updateUrlWithParams(updated);
  };

  const updateUrlWithParams = (params: QueryParam[]) => {
    const baseUrl = url.split("?")[0];
    const enabledParams = params.filter(
      (p) => p.enabled && p.key.trim() && p.value.trim()
    );

    isInternalUpdate.current = true;

    if (enabledParams.length === 0) {
      setUrl(baseUrl);
      return;
    }

    const queryString = enabledParams
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join("&");

    setUrl(`${baseUrl}?${queryString}`);
  };

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
        {activeTab === "params" && (
          <div>
            <label
              className={clsx(
                "block text-sm mb-2",
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              )}
            >
              Query Parameters
            </label>

            <div
              className={clsx(
                "mt-4 p-4 border rounded-xl space-y-3",
                theme === "dark"
                  ? "bg-[#10121b] border-gray-700"
                  : "bg-white border-gray-300"
              )}
            >
              {queryParams.map((param, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-center"
                >
                  <input
                    type="checkbox"
                    checked={param.enabled}
                    onChange={(e) =>
                      updateQueryParam(index, "enabled", e.target.checked)
                    }
                    className="col-span-1 h-4 w-4 justify-self-center"
                  />
                  <input
                    type="text"
                    value={param.key}
                    onChange={(e) =>
                      updateQueryParam(index, "key", e.target.value)
                    }
                    placeholder="Key"
                    className={clsx(
                      "col-span-5 px-3 py-2 border rounded text-sm ring-0 focus:outline-0",
                      theme === "dark"
                        ? "bg-gray-800 text-gray-200 border-gray-600"
                        : "bg-white text-gray-800 border-gray-300"
                    )}
                  />
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) =>
                      updateQueryParam(index, "value", e.target.value)
                    }
                    placeholder="Value"
                    className={clsx(
                      "col-span-5 px-3 py-2 border rounded text-sm ring-0 focus:outline-0",
                      theme === "dark"
                        ? "bg-gray-800 text-gray-200 border-gray-600"
                        : "bg-white text-gray-800 border-gray-300"
                    )}
                  />
                  <button
                    onClick={() => removeQueryParam(index)}
                    className={clsx(
                      "col-span-1 h-10 w-10 flex items-center justify-center rounded hover:bg-red-100 cursor-pointer",
                      theme === "dark"
                        ? "text-red-400 hover:bg-red-900/20"
                        : "text-red-600 hover:bg-red-50"
                    )}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={addQueryParam}
                className={clsx(
                  "mt-2 px-4 py-2 text-sm rounded border-2 cursor-pointer",
                  theme === "dark"
                    ? "border-gray-600 text-gray-400 hover:border-gray-500"
                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                )}
              >
                + Add Parameter
              </button>
            </div>

            <label
              className={clsx(
                "block text-sm mb-2 mt-6",
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              )}
            >
              URL Preview
            </label>
            <div
              className={clsx(
                "mt-2 p-4 border rounded-xl",
                theme === "dark"
                  ? "bg-[#10121b] border-gray-700"
                  : "bg-white border-gray-300"
              )}
            >
              <p className="text-sm text-gray-500 break-all">{url}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

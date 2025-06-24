import { TabComponent } from "./TabComponent";
import { GraphQLEditor } from "./GraphQLEditor";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { useRequest, QueryParam } from "../context/RequestContext";
import clsx from "clsx";
import { SelectAuth } from "./SelectAuth";
import { UsernameAndPassword } from "./UsernameAndPassword";
import { BearerToken } from "./BearerToken";
import { Trash2Icon, Copy, Check } from "lucide-react";
import { Checkbox } from "./Checkbox";
import { VariablesTab } from "./VariablesTab";

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
    queryParams,
    requestType,
    setPayload,
    setUsername,
    setPassword,
    setUseBasicAuth,
    setActiveTab,
    setBearerToken,
    formatJson,
    setUrl,
    setQueryParams,
  } = useRequest();

  const options = [
    { label: "Basic Auth", value: "basic" },
    { label: "Bearer Token", value: "bearer" },
  ];

  const [showPassword, setShowPassword] = useState(false);
  const [selectAuth, setSelectAuth] = useState(options[0].value);
  const [urlCopied, setUrlCopied] = useState(false);
  const isInternalUpdate = useRef(false);
  const isLoadingParams = useRef(false);


  //To-do: This effect updates queryParams based on the URL when the requestType is not GraphQL - I want to review this logic
  useEffect(() => {
    if (isInternalUpdate.current || isLoadingParams.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (requestType === "graphql") {
      return;
    }

    if (!url || url.trim() === "" || url === "{}" || !url.includes("://")) {
      return;
    }

    try {
      const urlObj = new URL(url);
      const urlParams = new URLSearchParams(urlObj.search);
      const params: QueryParam[] = [];

      urlParams.forEach((value, key) => {
        params.push({ key, value, enabled: true });
      });

      if (params.length === 0) {
        params.push({ key: "", value: "", enabled: true });
      }

      const paramsChanged =
        JSON.stringify(params) !== JSON.stringify(queryParams);

      if (paramsChanged && url.includes("?")) {
        isLoadingParams.current = true;
        setQueryParams(params);
        setTimeout(() => {
          isLoadingParams.current = false;
        }, 100);
      }
    } catch (error) {
      console.warn("Invalid URL format:", url);
    }
  }, [url, requestType]);

  const lines = payload.split("\n");

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: "", value: "", enabled: true }]);
  };

  const removeQueryParam = (index: number) => {
    const newParams = queryParams.filter((_, i) => i !== index);
    if (newParams.length === 0) {
      setQueryParams([{ key: "", value: "", enabled: true }]);
    } else {
      setQueryParams(newParams);
    }
    updateUrlWithParams(newParams);
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
    if (!url || url.trim() === "" || url === "{}") {
      return;
    }

    const baseUrl = url.split("?")[0] || "";
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
        <TabComponent
          activeTab={activeTab}
          onTabChange={setActiveTab}
          request={requestType}
        />

        {activeTab === "graphql" && requestType === "graphql" && <GraphQLEditor />}

        {activeTab === "body" && requestType === "http" && (
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
                "border rounded-xl min-h-[492px] max-h-[492px] overflow-hidden",
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

        {/* Auth Tab */}
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

        {activeTab === "params" && requestType === "http" && (
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
                "mt-4 p-4 border rounded-xl space-y-2",
                theme === "dark"
                  ? "bg-[#10121b] border-gray-700"
                  : "bg-white border-gray-300"
              )}
            >
              {queryParams.map((param, index) => (
                <div key={index} className="flex gap-2 items-center min-w-0">
                  <input
                    type="text"
                    value={param.key}
                    onChange={(e) =>
                      updateQueryParam(index, "key", e.target.value)
                    }
                    placeholder="Key"
                    className={clsx(
                      "flex-1 min-w-0 px-2 py-1 border rounded text-xs ring-0 focus:outline-0",
                      theme === "dark"
                        ? "bg-[#10121b] text-white border-2 border-purple-500 focus:border-purple-500"
                        : "bg-white text-gray-800 border-2 border-purple-500 focus:border-purple-500"
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
                      "flex-1 min-w-0 px-2 py-1 border rounded text-xs ring-0 focus:outline-0",
                      theme === "dark"
                        ? "bg-[#10121b] text-white border-2 border-purple-500 focus:border-purple-500"
                        : "bg-white text-gray-800 border-2 border-purple-500 focus:border-purple-500"
                    )}
                  />
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Checkbox
                      checked={param.enabled}
                      onChange={(checked) =>
                        updateQueryParam(index, "enabled", checked)
                      }
                      theme={theme}
                    />
                    <button
                      onClick={() => removeQueryParam(index)}
                      className={clsx(
                        "h-5 w-5 flex items-center justify-center rounded cursor-pointer",
                        theme === "dark"
                          ? "text-gray-400 hover:text-gray-200"
                          : "text-gray-600 hover:text-gray-800"
                      )}
                      type="button"
                      aria-label="Remove Parameter"
                      title="Remove Parameter"
                    >
                      <Trash2Icon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={addQueryParam}
                className={clsx(
                  "mt-2 px-3 py-1 text-xs rounded border-2 cursor-pointer",
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
                "mt-2 p-4 border rounded-xl h-28 relative group",
                theme === "dark"
                  ? "bg-[#10121b] border-gray-700"
                  : "bg-white border-gray-300"
              )}
            >
              <p className="text-sm text-gray-500 break-all pr-8">{url}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(url);
                  setUrlCopied(true);
                  setTimeout(() => setUrlCopied(false), 2000);
                }}
                className={clsx(
                  "absolute top-3 right-3 p-1 rounded transition-opacity cursor-pointer",
                  theme === "dark"
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-200 text-gray-600"
                )}
                title="Copy URL"
              >
                {urlCopied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === "variables" && <VariablesTab />}
      </div>
    </>
  );
};

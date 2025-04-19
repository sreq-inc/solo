import { useTheme } from "../context/ThemeContext";
import { useRequest } from "../context/RequestContext";
import clsx from "clsx";

export const ResponseView = () => {
  const { theme } = useTheme();
  const { response, error, loading, isCopied, handleCopyResponse } =
    useRequest();

  const lines = response ? JSON.stringify(response, null, 2).split("\n") : [];

  return (
    <div className="p-4 space-y-4 col-span-5 h-full">
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
      <div
        className={clsx(
          "relative rounded min-h-[600px] h-96 overflow-auto font-mono",
          theme === "dark" ? "bg-gray-800" : "bg-gray-100"
        )}
      >
        <table className="w-full table-fixed">
          <tbody>
            {loading ? (
              <tr>
                <td
                  className={clsx(
                    "text-right pr-4 select-none w-12 border-r sticky left-0",
                    theme === "dark"
                      ? "text-gray-500 border-gray-700 bg-gray-800"
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
              <tr>
                <td
                  className={clsx(
                    "text-right pr-4 select-none w-12 border-r sticky left-0",
                    theme === "dark"
                      ? "text-gray-500 border-gray-700 bg-gray-800"
                      : "text-gray-500 border-gray-300 bg-gray-100"
                  )}
                >
                  1
                </td>
                <td
                  className={clsx(
                    "pl-4",
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  No response yet
                </td>
              </tr>
            ) : (
              lines.map((line, i) => (
                <tr
                  key={i}
                  className={clsx(
                    theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-200"
                  )}
                >
                  <td
                    className={clsx(
                      "text-right pr-4 select-none w-12 border-r sticky left-0",
                      theme === "dark"
                        ? "text-gray-500 border-gray-700 bg-gray-900"
                        : "text-gray-500 border-gray-300 bg-gray-100"
                    )}
                  >
                    {i + 1}
                  </td>
                  <td
                    className={clsx(
                      "pl-4 whitespace-pre overflow-x-auto",
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
      </div>
      {response && (
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

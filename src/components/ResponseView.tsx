import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";

type ResponseViewProps = {
  response: any;
  error: string | null;
  loading: boolean;
  onCopyResponse: () => void;
};

export const ResponseView = ({
  response,
  error,
  loading,
  onCopyResponse,
}: ResponseViewProps) => {
  const { theme } = useTheme();
  const lines = response ? JSON.stringify(response, null, 2).split("\n") : [];

  return (
    <div className="p-4 space-y-4 col-span-5 h-full">
      {error && (
        <div
          className={clsx(
            "p-2 rounded",
            theme === "dark"
              ? "bg-red-900 text-red-300"
              : "bg-red-100 text-red-800",
          )}
        >
          {error}
        </div>
      )}
      <div
        className={clsx(
          "relative rounded h-full overflow-auto font-mono",
          theme === "dark" ? "bg-gray-800" : "bg-gray-100",
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
                      : "text-gray-500 border-gray-300 bg-gray-100",
                  )}
                >
                  1
                </td>
                <td
                  className={clsx(
                    "pl-4",
                    theme === "dark" ? "text-gray-300" : "text-gray-800",
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
                      : "text-gray-500 border-gray-300 bg-gray-100",
                  )}
                >
                  1
                </td>
                <td
                  className={clsx(
                    "pl-4",
                    theme === "dark" ? "text-gray-400" : "text-gray-600",
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
                    theme === "dark"
                      ? "hover:bg-gray-800"
                      : "hover:bg-gray-200",
                  )}
                >
                  <td
                    className={clsx(
                      "text-right pr-4 select-none w-12 border-r sticky left-0",
                      theme === "dark"
                        ? "text-gray-500 border-gray-700 bg-gray-900"
                        : "text-gray-500 border-gray-300 bg-gray-100",
                    )}
                  >
                    {i + 1}
                  </td>
                  <td
                    className={clsx(
                      "pl-4 whitespace-pre overflow-x-auto",
                      theme === "dark" ? "text-gray-300" : "text-gray-800",
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
          onClick={onCopyResponse}
          className={clsx(
            "w-full p-2 rounded",
            theme === "dark"
              ? "bg-purple-900 text-purple-300 hover:bg-purple-800"
              : "bg-purple-200 text-purple-800 hover:bg-purple-300",
          )}
        >
          Copy Response
        </button>
      )}
    </div>
  );
};

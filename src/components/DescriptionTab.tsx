import { useTheme } from "../context/ThemeContext";
import { useRequest } from "../context/RequestContext";
import clsx from "clsx";

export const DescriptionTab = () => {
  const { theme } = useTheme();
  const { description, setDescription } = useRequest();

  return (
    <div className="mt-4">
      <label
        className={clsx(
          "block text-sm mb-2",
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        )}
      >
        Request Description
      </label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe what this request does, add notes, or document expected behavior..."
        rows={8}
        className={clsx(
          "w-full p-3 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2",
          theme === "dark"
            ? "bg-[#10121b] text-white border-gray-600 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400"
            : "bg-white text-gray-800 border-gray-300 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500"
        )}
      />

      <div className={clsx(
        "mt-4 p-4 rounded-lg border",
        theme === "dark"
          ? "bg-gray-800/30 border-gray-700"
          : "bg-gray-50 border-gray-200"
      )}>
        <div className={clsx(
          "text-sm font-medium mb-2",
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        )}>
          💡 Documentation Tips
        </div>
        <div className={clsx(
          "text-xs space-y-2",
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        )}>
          <div>
            <strong>What to document:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1 ml-2">
              <li>Purpose and functionality of this request</li>
              <li>Expected response format and status codes</li>
              <li>Required authentication or headers</li>
              <li>Special parameters or configurations</li>
              <li>Known issues or limitations</li>
            </ul>
          </div>

          <div>
            <strong>Example:</strong>
            <div className={clsx(
              "mt-1 p-2 rounded text-xs font-mono",
              theme === "dark"
                ? "bg-gray-800 text-gray-300"
                : "bg-white text-gray-700 border"
            )}>
              "Fetches user profile data for the dashboard.<br />
              Requires Bearer token authentication.<br />
              Returns 404 if user doesn't exist."
            </div>
          </div>
        </div>
      </div>

      {description && (
        <div className={clsx(
          "mt-3 text-xs",
          theme === "dark" ? "text-gray-500" : "text-gray-600"
        )}>
          Character count: {description.length}
        </div>
      )}
    </div>
  );
};

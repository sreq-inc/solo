import clsx from "clsx";
import { useTheme } from "../context/ThemeContext";

export type BearerTokenProps = {
  onTokenChange: (token: string) => void;
  bearerToken: string;
};

export const BearerToken = ({
  onTokenChange,
  bearerToken,
}: BearerTokenProps) => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-start">
      <label
        className={clsx(
          "text-sm font-medium mb-4",
          theme === "dark" ? "text-white" : "text-gray-700"
        )}
      >
        Bearer Token Authentication
      </label>

      <input
        onChange={(e) => onTokenChange(e.target.value)}
        value={bearerToken}
        className={clsx(
          "w-full p-2 border rounded text-sm mb-4",
          theme === "dark"
            ? "bg-gray-700 border-gray-600 text-white"
            : "bg-white border-gray-300 text-gray-800"
        )}
      />
    </div>
  );
};

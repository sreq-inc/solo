import clsx from "clsx";
import { useTheme } from "../context/ThemeContext";

export type BearerTokenProps = {
  onTokenChange: (token: string) => void;
  bearerToken: string;
};

export const BearerToken = ({ onTokenChange, bearerToken }: BearerTokenProps) => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-start">
      <input
        onChange={(e) => onTokenChange(e.target.value)}
        value={bearerToken}
        placeholder="Bearer Token"
        className={clsx(
          "w-full h-10 p-2 border rounded-md outline-none",
          theme === "dark"
            ? "bg-gray-800 text-gray-200 border-gray-700"
            : "bg-white text-gray-700 border-gray-300"
        )}
      />
    </div>
  );
};

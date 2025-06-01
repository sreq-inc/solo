import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";

interface CopyIconProps {
  content: string;
  size?: number;
  className?: string;
}

export const CopyIcon = ({
  content,
  size = 16,
  className = "",
}: CopyIconProps) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={clsx(
        "p-1 rounded transition-colors cursor-pointer",
        theme === "dark"
          ? "hover:bg-gray-600 text-gray-400 hover:text-gray-200"
          : "hover:bg-gray-200 text-gray-600 hover:text-gray-800",
        className,
      )}
      title="Copy as cURL"
    >
      {copied ? (
        <Check size={size} className="text-green-500" />
      ) : (
        <Copy size={size} />
      )}
    </button>
  );
};

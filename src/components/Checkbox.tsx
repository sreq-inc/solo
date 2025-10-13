import { Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export const Checkbox = ({
  checked,
  onChange,
  label,
  className = "",
}: CheckboxProps) => {
  const { theme } = useTheme();

  return (
    <label
      className={clsx(
        "flex items-center gap-3 cursor-pointer group",
        className
      )}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={clsx(
            "w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center",
            checked
              ? theme === "dark"
                ? "bg-purple-500 border-purple-500"
                : "bg-purple-600 border-purple-600"
              : theme === "dark"
                ? "border-gray-600 bg-transparent"
                : "border-gray-300 bg-transparent",
            "group-hover:border-opacity-75"
          )}
        >
          {checked && <Check size={12} className="text-white" />}
        </div>
      </div>
      {label && (
        <span
          className={clsx(theme === "dark" ? "text-gray-200" : "text-gray-700")}
        >
          {label}
        </span>
      )}
    </label>
  );
};

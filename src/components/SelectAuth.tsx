import clsx from "clsx";
import type { Dispatch } from "react";
import { useTheme } from "../context/ThemeContext";

export type SelectAuthProps = {
  onChange: Dispatch<React.SetStateAction<string>>;
  value: string;
  options: { label: string; value: string }[];
};

export const SelectAuth = ({ onChange, value, options }: SelectAuthProps) => {
  const { theme } = useTheme();

  return (
    <div className="relative">
      <select
        className={clsx(
          "block appearance-none w-full border rounded-md py-2 px-3 pr-8 leading-tight focus:outline-none cursor-pointer",
          theme === "dark"
            ? "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg
          className={clsx("w-4 h-4", theme === "dark" ? "text-gray-400" : "text-gray-500")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

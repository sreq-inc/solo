import React from "react";
import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";

interface SelectMethodProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export const SelectMethod: React.FC<SelectMethodProps> = ({
  value,
  options,
  onChange,
}) => {
  const { theme } = useTheme();

  return (
    <div className="flex-shrink-0 w-28">
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          title={`HTTP Method: ${value}`}
          className={clsx(
            "block appearance-none w-full border rounded-lg py-2 px-4 pr-8 leading-tight focus:outline-none focus:ring-1 cursor-pointer",
            theme === "dark"
              ? "text-white bg-[#10121b] border-purple-500 ring-purple-500 border-2"
              : " text-gray-700 bg-white border-purple-500 ring-purple-500 border-2"
          )}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className={clsx(
              "w-4 h-4",
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

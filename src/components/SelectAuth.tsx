import clsx from "clsx";
import { Dispatch } from "react";
import { useTheme } from "../context/ThemeContext";

export type SelectAuthProps = {
  onChange: Dispatch<React.SetStateAction<string>>;
  value: string;
  options: { label: string; value: string }[];
};

export const SelectAuth = ({ onChange, value, options }: SelectAuthProps) => {
  const { theme } = useTheme();

  return (
    <select
      className={clsx(
        "block appearance-none w-full border rounded-lg py-2 px-4 pr-8 leading-tight focus:outline-none focus:ring-1",
        theme === "dark"
          ? "bg-gray-700 text-white border-gray-600 focus:bg-gray-800 focus:border-purple-500 focus:ring-purple-500"
          : "bg-white text-gray-700 border-gray-300 focus:bg-white focus:border-purple-500 focus:ring-purple-500"
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
  );
};

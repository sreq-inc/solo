import React from "react";

interface SelectMethodProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const SelectMethod: React.FC<SelectMethodProps> = ({
  label,
  value,
  options,
  onChange,
}) => {
  return (
    <div className="flex-shrink-0 w-32">
      <label className="block text-sm mb-2">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block appearance-none w-full bg-white text-gray-700 border border-gray-300 rounded-lg py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500"
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

export default SelectMethod;

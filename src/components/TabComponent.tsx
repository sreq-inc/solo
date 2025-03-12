type Tab = "body" | "auth";

type TabComponentProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export const TabComponent = ({ activeTab, onTabChange }: TabComponentProps) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px">
        <button
          onClick={() => onTabChange("body")}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === "body"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Body
        </button>
        <button
          onClick={() => onTabChange("auth")}
          className={`ml-8 py-2 px-4 text-sm font-medium ${
            activeTab === "auth"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Auth
        </button>
      </nav>
    </div>
  );
};

import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";

type Tab = "body" | "auth" | "params" | "graphql";

type TabComponentProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  availableTabs: readonly Tab[];
  requestType: "http" | "graphql";
};

export const TabComponent = ({
  activeTab,
  onTabChange,
  availableTabs,
  requestType
}: TabComponentProps) => {
  const { theme } = useTheme();

  const getTabLabel = (tab: Tab) => {
    switch (tab) {
      case "body":
        return "Body";
      case "auth":
        return "Auth";
      case "params":
        return "Params";
      case "graphql":
        return "GraphQL";
      default:
        return tab;
    }
  };

  return (
    <div
      className={clsx(
        "border-b",
        theme === "dark" ? "border-gray-700" : "border-gray-950"
      )}
    >
      <nav className="flex -mb-px">
        {availableTabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={clsx(
              "py-2 px-4 text-sm font-medium cursor-pointer",
              index > 0 && "ml-8",
              activeTab === tab
                ? theme === "dark"
                  ? "border-b-2 border-purple-500 text-purple-400"
                  : "border-b-2 border-purple-600 text-purple-600"
                : theme === "dark"
                  ? "text-gray-400 hover:text-gray-300 hover:border-gray-700"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </nav>
    </div>
  );
};

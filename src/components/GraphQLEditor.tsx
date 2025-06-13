import { useTheme } from "../context/ThemeContext";
import { useRequest } from "../context/RequestContext";
import clsx from "clsx";

export const GraphQLEditor = () => {
  const { theme } = useTheme();
  const { graphqlQuery, graphqlVariables, setGraphqlQuery, setGraphqlVariables, formatGraphqlVariables } = useRequest();

  const queryLines = graphqlQuery.split("\n");
  const variablesLines = graphqlVariables.split("\n");

  return (
    <div className="mt-4 space-y-4">
      {/* GraphQL Query Section */}
      <div>
        <label
          className={clsx(
            "block text-sm mb-2",
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          )}
        >
          GraphQL Query
        </label>
        <div
          className={clsx(
            "border rounded-xl min-h-[300px] max-h-[300px] overflow-hidden",
            theme === "dark"
              ? "bg-[#10121b] border-gray-600"
              : "bg-white border-gray-300"
          )}
        >
          <div className="flex h-full">
            <div
              className={clsx(
                "select-none border-r w-12 flex flex-col text-right text-xs overflow-y-auto",
                theme === "dark"
                  ? "border-gray-700 bg-gray-900 text-gray-500"
                  : "border-gray-300 bg-gray-100 text-gray-500"
              )}
            >
              {queryLines.map((_, index) => (
                <div
                  key={index}
                  className="leading-6 min-h-[24px] text-center text-sm"
                >
                  {index + 1}
                </div>
              ))}
            </div>
            <textarea
              value={graphqlQuery}
              onChange={(e) => setGraphqlQuery(e.target.value)}
              placeholder="query {
  users {
    id
    name
    email
  }
}"
              className={clsx(
                "flex-1 px-4 pb-4 text-xs focus:outline-0 ring-0 resize-none border-0 bg-transparent leading-6 overflow-y-auto",
                theme === "dark" ? "text-white" : "text-gray-800"
              )}
              style={{ lineHeight: "24px" }}
            />
          </div>
        </div>
      </div>

      {/* GraphQL Variables Section */}
      <div>
        <label
          className={clsx(
            "block text-sm mb-2",
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          )}
        >
          Variables (JSON)
        </label>
        <div
          className={clsx(
            "border rounded-xl min-h-[150px] max-h-[150px] overflow-hidden",
            theme === "dark"
              ? "bg-[#10121b] border-gray-600"
              : "bg-white border-gray-300"
          )}
        >
          <div className="flex h-full">
            <div
              className={clsx(
                "select-none border-r w-12 flex flex-col text-right text-xs overflow-y-auto",
                theme === "dark"
                  ? "border-gray-700 bg-gray-900 text-gray-500"
                  : "border-gray-300 bg-gray-100 text-gray-500"
              )}
            >
              {variablesLines.map((_, index) => (
                <div
                  key={index}
                  className="leading-6 min-h-[24px] text-center text-sm"
                >
                  {index + 1}
                </div>
              ))}
            </div>
            <textarea
              value={graphqlVariables}
              onChange={(e) => setGraphqlVariables(e.target.value)}
              placeholder='{
  "userId": 1,
  "limit": 10
}'
              className={clsx(
                "flex-1 px-4 pb-4 text-xs focus:outline-0 ring-0 resize-none border-0 bg-transparent leading-6 overflow-y-auto",
                theme === "dark" ? "text-white" : "text-gray-800"
              )}
              style={{ lineHeight: "24px" }}
            />
          </div>
        </div>
        <button
          onClick={formatGraphqlVariables}
          className={clsx(
            "mt-2 py-2 rounded text-xs font-semibold cursor-pointer",
            theme === "dark" ? "text-gray-600" : "text-gray-500"
          )}
        >
          Format Variables JSON
        </button>
      </div>
    </div>
  );
};

import { useTheme } from "../context/ThemeContext";
import { useRequest } from "../context/RequestContext";
import clsx from "clsx";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const GraphQLEditor = () => {
  const { theme } = useTheme();
  const {
    graphqlQuery,
    graphqlVariables,
    setGraphqlQuery,
    setGraphqlVariables,
    formatGraphqlVariables,
  } = useRequest();
  const [isFormattingVariables, setIsFormattingVariables] = useState(false);
  const [variablesValidationError, setVariablesValidationError] = useState<
    string | null
  >(null);

  const queryLines = graphqlQuery.split("\n");
  const variablesLines = graphqlVariables.split("\n");

  // Validate GraphQL variables JSON in real-time
  useEffect(() => {
    if (graphqlVariables.trim() === "" || graphqlVariables.trim() === "{}") {
      setVariablesValidationError(null);
      return;
    }

    try {
      JSON.parse(graphqlVariables);
      setVariablesValidationError(null);
    } catch (error) {
      if (error instanceof Error) {
        setVariablesValidationError(error.message);
      }
    }
  }, [graphqlVariables]);

  const handleFormatVariables = async () => {
    setIsFormattingVariables(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    formatGraphqlVariables();
    setIsFormattingVariables(false);
  };

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
              placeholder={`query GetUser($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
    posts {
      title
      content
    }
  }
}

# Or a mutation:
# mutation CreateUser($input: UserInput!) {
#   createUser(input: $input) {
#     id
#     name
#   }
# }`}
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
        <div className="flex items-center justify-between mb-2">
          <label
            className={clsx(
              "block text-sm",
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            )}
          >
            Variables (JSON)
          </label>
          {graphqlVariables.trim() !== "" &&
            graphqlVariables.trim() !== "{}" && (
              <div className="flex items-center gap-1.5 text-xs">
                {variablesValidationError ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-red-500">Invalid JSON</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-500">Valid JSON</span>
                  </>
                )}
              </div>
            )}
        </div>
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
              placeholder={`{
  "userId": "123",
  "limit": 10,
  "input": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}`}
              className={clsx(
                "flex-1 px-4 pb-4 text-xs focus:outline-0 ring-0 resize-none border-0 bg-transparent leading-6 overflow-y-auto",
                theme === "dark" ? "text-white" : "text-gray-800"
              )}
              style={{ lineHeight: "24px" }}
            />
          </div>
        </div>
        {variablesValidationError && (
          <div
            className={clsx(
              "mt-2 p-2 rounded text-xs flex items-start gap-2",
              theme === "dark"
                ? "bg-red-900/20 text-red-400"
                : "bg-red-100 text-red-700"
            )}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{variablesValidationError}</span>
          </div>
        )}
        <button
          onClick={handleFormatVariables}
          disabled={isFormattingVariables || !!variablesValidationError}
          title={
            variablesValidationError
              ? "Fix JSON errors before formatting"
              : "Format Variables JSON"
          }
          className={clsx(
            "mt-2 py-2 rounded text-xs font-semibold cursor-pointer flex items-center gap-2",
            theme === "dark" ? "text-gray-600" : "text-gray-500",
            (isFormattingVariables || variablesValidationError) &&
              "opacity-50 cursor-not-allowed"
          )}
        >
          {isFormattingVariables && (
            <Loader2 className="w-3 h-3 animate-spin" />
          )}
          Format Variables JSON
        </button>
      </div>
    </div>
  );
};

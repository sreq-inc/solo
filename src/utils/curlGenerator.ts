import { QueryParam } from "../context/RequestContext";

interface RequestData {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  payload?: string;
  useBasicAuth?: boolean;
  username?: string;
  password?: string;
  bearerToken?: string;
  queryParams?: QueryParam[];
  requestType?: "http" | "graphql";
  graphqlQuery?: string;
  graphqlVariables?: string;
}

// Function to replace variables in URL
const replaceVariablesInUrl = (url: string): string => {
  // Get variables from localStorage for the current folder
  const currentFolder = sessionStorage.getItem('current-request-folder');
  if (!currentFolder) return url;

  const storageKey = `solo-variables-${currentFolder}`;
  const savedVariables = localStorage.getItem(storageKey);

  if (!savedVariables) return url;

  try {
    const variables = JSON.parse(savedVariables);
    let processedUrl = url;

    // Replace each enabled variable
    variables.forEach((variable: any) => {
      if (variable.enabled && variable.key && variable.value) {
        const pattern = new RegExp(
          `\\{\\{\\s*${variable.key.trim()}\\s*\\}\\}`,
          "g"
        );
        processedUrl = processedUrl.replace(pattern, variable.value.trim());
      }
    });

    return processedUrl;
  } catch (error) {
    console.warn("Error processing variables:", error);
    return url;
  }
};

export const generateCurl = (requestData: RequestData): string => {
  if (requestData.requestType === "graphql") {
    return generateGraphQLCurl(requestData);
  }

  let curl = `curl -X ${requestData.method}`;

  // Process variables in URL
  let finalUrl = replaceVariablesInUrl(requestData.url || "");

  // Add query parameters if they exist
  if (requestData.queryParams && requestData.queryParams.length > 0) {
    const enabledParams = requestData.queryParams.filter(
      (param) => param.enabled && param.key.trim() && param.value.trim()
    );

    if (enabledParams.length > 0) {
      const baseUrl = finalUrl.split("?")[0];
      const queryString = enabledParams
        .map(
          (param) =>
            `${encodeURIComponent(param.key)}=${encodeURIComponent(
              param.value
            )}`
        )
        .join("&");
      finalUrl = `${baseUrl}?${queryString}`;
    }
  }

  curl += ` "${finalUrl}"`;

  // Add authentication
  if (requestData.useBasicAuth && requestData.username) {
    curl += ` -u "${requestData.username}:${requestData.password || ""}"`;
  }

  if (requestData.bearerToken && requestData.bearerToken.trim()) {
    curl += ` -H "Authorization: Bearer ${requestData.bearerToken}"`;
  }

  // Add payload for methods that support it
  if (
    requestData.payload &&
    requestData.payload.trim() &&
    ["POST", "PUT", "PATCH"].includes(requestData.method)
  ) {
    curl += ` -H "Content-Type: application/json"`;
    const escapedPayload = requestData.payload.replace(/"/g, '\\"');
    curl += ` -d "${escapedPayload}"`;
  }

  return curl;
};

const generateGraphQLCurl = (requestData: RequestData): string => {
  let curl = `curl -X POST`;

  // Process variables in URL for GraphQL
  let finalUrl = replaceVariablesInUrl(requestData.url || "");
  curl += ` "${finalUrl}"`;

  curl += ` -H "Content-Type: application/json"`;

  // Add authentication
  if (requestData.useBasicAuth && requestData.username) {
    curl += ` -u "${requestData.username}:${requestData.password || ""}"`;
  }

  if (requestData.bearerToken && requestData.bearerToken.trim()) {
    curl += ` -H "Authorization: Bearer ${requestData.bearerToken}"`;
  }

  // Create GraphQL body
  const graphqlBody = {
    query: requestData.graphqlQuery || "",
    variables: requestData.graphqlVariables
      ? (() => {
        try {
          return JSON.parse(requestData.graphqlVariables);
        } catch {
          return {};
        }
      })()
      : {},
  };

  const escapedBody = JSON.stringify(graphqlBody).replace(/"/g, '\\"');
  curl += ` -d "${escapedBody}"`;

  return curl;
};

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

export const generateCurl = (requestData: RequestData): string => {
  // GraphQL requests don't translate well to cURL in the traditional sense
  // since they're typically POST requests with JSON bodies
  if (requestData.requestType === "graphql") {
    return generateGraphQLCurl(requestData);
  }

  let curl = `curl -X ${requestData.method}`;
  let finalUrl = requestData.url || "";

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

  if (requestData.useBasicAuth && requestData.username) {
    curl += ` -u "${requestData.username}:${requestData.password || ""}"`;
  }

  if (requestData.bearerToken && requestData.bearerToken.trim()) {
    curl += ` -H "Authorization: Bearer ${requestData.bearerToken}"`;
  }

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
  let finalUrl = requestData.url || "";

  curl += ` "${finalUrl}"`;
  curl += ` -H "Content-Type: application/json"`;

  // Add authentication headers
  if (requestData.useBasicAuth && requestData.username) {
    curl += ` -u "${requestData.username}:${requestData.password || ""}"`;
  }

  if (requestData.bearerToken && requestData.bearerToken.trim()) {
    curl += ` -H "Authorization: Bearer ${requestData.bearerToken}"`;
  }

  // Build GraphQL request body
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
      : {}
  };

  const escapedBody = JSON.stringify(graphqlBody).replace(/"/g, '\\"');
  curl += ` -d "${escapedBody}"`;

  return curl;
};

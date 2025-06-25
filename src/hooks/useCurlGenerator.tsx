import { useRequest } from "../context/RequestContext";
import { useVariables } from "../context/VariablesContext";

export const useCurlGenerator = () => {
  const {
    method,
    url,
    payload,
    useBasicAuth,
    username,
    password,
    bearerToken,
    queryParams,
    requestType,
    graphqlQuery,
    graphqlVariables,
  } = useRequest();

  const { replaceVariablesInUrl } = useVariables();

  const generateCurl = (): string => {
    if (requestType === "graphql") {
      return generateGraphQLCurl();
    }

    let curl = `curl -X ${method}`;

    // Process variables in URL
    let finalUrl = replaceVariablesInUrl(url || "");

    // Add query parameters if they exist
    if (queryParams && queryParams.length > 0) {
      const enabledParams = queryParams.filter(
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
    if (useBasicAuth && username) {
      curl += ` -u "${username}:${password || ""}"`;
    }

    if (bearerToken && bearerToken.trim()) {
      curl += ` -H "Authorization: Bearer ${bearerToken}"`;
    }

    // Add payload for methods that support it
    if (
      payload &&
      payload.trim() &&
      ["POST", "PUT", "PATCH"].includes(method)
    ) {
      curl += ` -H "Content-Type: application/json"`;
      const escapedPayload = payload.replace(/"/g, '\\"');
      curl += ` -d "${escapedPayload}"`;
    }

    return curl;
  };

  const generateGraphQLCurl = (): string => {
    let curl = `curl -X POST`;

    // Process variables in URL for GraphQL
    let finalUrl = replaceVariablesInUrl(url || "");
    curl += ` "${finalUrl}"`;

    curl += ` -H "Content-Type: application/json"`;

    // Add authentication
    if (useBasicAuth && username) {
      curl += ` -u "${username}:${password || ""}"`;
    }

    if (bearerToken && bearerToken.trim()) {
      curl += ` -H "Authorization: Bearer ${bearerToken}"`;
    }

    // Create GraphQL body
    const graphqlBody = {
      query: graphqlQuery || "",
      variables: graphqlVariables
        ? (() => {
          try {
            return JSON.parse(graphqlVariables);
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

  return {
    generateCurl,
    processedUrl: replaceVariablesInUrl(url || ""),
  };
};

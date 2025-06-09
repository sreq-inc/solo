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
}

// Function to replace variables in the format {{variableName}}
const replaceVariables = (text: string): string => {
  try {
    // Get variables from localStorage
    const savedVariables = localStorage.getItem("solo-variables");
    if (!savedVariables) return text;

    const variables = JSON.parse(savedVariables);
    let processedText = text;

    // Replace each enabled variable
    variables.forEach((variable: any) => {
      if (variable.enabled && variable.key.trim() && variable.value.trim()) {
        const pattern = new RegExp(`\\{\\{\\s*${variable.key.trim()}\\s*\\}\\}`, 'g');
        processedText = processedText.replace(pattern, variable.value.trim());
      }
    });

    return processedText;
  } catch (error) {
    console.error('Error processing variables:', error);
    return text;
  }
};

export const generateCurl = (requestData: RequestData): string => {
  let curl = `curl -X ${requestData.method}`;

  // Process the URL by replacing variables
  let finalUrl = replaceVariables(requestData.url || "");

  if (requestData.queryParams && requestData.queryParams.length > 0) {
    const enabledParams = requestData.queryParams.filter(
      (param) => param.enabled && param.key.trim() && param.value.trim(),
    );

    if (enabledParams.length > 0) {
      const baseUrl = finalUrl.split("?")[0];
      const queryString = enabledParams
        .map(
          (param) =>
            `${encodeURIComponent(param.key)}=${encodeURIComponent(
              param.value,
            )}`,
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

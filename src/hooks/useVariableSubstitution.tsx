import { Variable } from "../context/RequestContext";

export const useVariableSubstitution = () => {
  const replaceVariablesInUrl = (
    url: string,
    variables: Variable[]
  ): string => {
    let processedUrl = url;

    const enabledVariables = variables.filter(
      (variable) =>
        variable.enabled &&
        variable.key.trim() !== "" &&
        variable.value.trim() !== ""
    );

    enabledVariables.forEach((variable) => {
      const pattern = new RegExp(
        `\\{\\{\\s*${variable.key.trim()}\\s*\\}\\}`,
        "g"
      );
      processedUrl = processedUrl.replace(pattern, variable.value.trim());
    });

    return processedUrl;
  };

  const findVariables = (text: string, variables: Variable[]) => {
    const matches = [];
    const regex = /\{\{\s*([^}]+)\s*\}\}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const variableName = match[1].trim();
      const existingVariable = variables.find(
        (v) => v.key.trim() === variableName && v.enabled && v.value.trim()
      );

      matches.push({
        variable: variableName,
        exists: !!existingVariable,
        value: existingVariable?.value || "",
        fullMatch: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    return matches;
  };

  return {
    replaceVariablesInUrl,
    findVariables,
  };
};

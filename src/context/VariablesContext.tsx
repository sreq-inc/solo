import { createContext, useContext, useState, ReactNode } from "react";

export type Variable = {
  key: string;
  value: string;
  enabled: boolean;
};

type VariablesContextType = {
  variables: Variable[];
  setVariables: (variables: Variable[]) => void;
  addVariable: () => void;
  removeVariable: (index: number) => void;
  updateVariable: (
    index: number,
    field: keyof Variable,
    value: string | boolean
  ) => void;
  replaceVariablesInUrl: (url: string) => string;
};

const VariablesContext = createContext<VariablesContextType | undefined>(
  undefined
);

interface VariablesProviderProps {
  children: ReactNode;
}

function VariablesProvider({ children }: VariablesProviderProps) {
  const [variables, setVariables] = useState<Variable[]>(() => {
    const saved = localStorage.getItem("solo-variables");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [{ key: "", value: "", enabled: true }];
      }
    }
    return [{ key: "", value: "", enabled: true }];
  });

  const updateVariables = (newVariables: Variable[]) => {
    setVariables(newVariables);
    localStorage.setItem("solo-variables", JSON.stringify(newVariables));
  };

  const addVariable = () => {
    updateVariables([...variables, { key: "", value: "", enabled: true }]);
  };

  const removeVariable = (index: number) => {
    const newVariables = variables.filter((_, i) => i !== index);
    if (newVariables.length === 0) {
      updateVariables([{ key: "", value: "", enabled: true }]);
    } else {
      updateVariables(newVariables);
    }
  };

  const updateVariable = (
    index: number,
    field: keyof Variable,
    value: string | boolean
  ) => {
    const updated = variables.map((variable, i) =>
      i === index ? { ...variable, [field]: value } : variable
    );
    updateVariables(updated);
  };

  const replaceVariablesInUrl = (url: string): string => {
    let processedUrl = url;

    console.log("=== SUBSTITUIÇÃO DE VARIÁVEIS ===");
    console.log("URL original:", url);
    console.log("Variáveis disponíveis:", variables);

    // Filtra apenas variáveis habilitadas e com chave/valor preenchidos
    const enabledVariables = variables.filter(
      (variable) =>
        variable.enabled &&
        variable.key.trim() !== "" &&
        variable.value.trim() !== ""
    );

    console.log("Variáveis habilitadas:", enabledVariables);

    enabledVariables.forEach((variable) => {
      const pattern = new RegExp(
        `\\{\\{\\s*${variable.key.trim()}\\s*\\}\\}`,
        "g"
      );
      const oldUrl = processedUrl;
      processedUrl = processedUrl.replace(pattern, variable.value.trim());

      if (oldUrl !== processedUrl) {
        console.log(`Substituiu {{${variable.key}}} por "${variable.value}"`);
        console.log("URL após substituição:", processedUrl);
      }
    });

    console.log("URL final:", processedUrl);
    console.log("=== FIM DA SUBSTITUIÇÃO ===");

    return processedUrl;
  };

  const contextValue: VariablesContextType = {
    variables,
    setVariables: updateVariables,
    addVariable,
    removeVariable,
    updateVariable,
    replaceVariablesInUrl,
  };

  return (
    <VariablesContext.Provider value={contextValue}>
      {children}
    </VariablesContext.Provider>
  );
}

function useVariables(): VariablesContextType {
  const context = useContext(VariablesContext);
  if (context === undefined) {
    throw new Error("useVariables must be used within a VariablesProvider");
  }
  return context;
}

export { VariablesProvider, useVariables };

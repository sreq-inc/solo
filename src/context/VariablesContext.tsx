import { createContext, useContext, useState, ReactNode, useEffect } from "react";

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
  currentFolder: string | null;
  loadVariablesForFolder: (folderName: string) => void;
  clearVariables: () => void;
  detectAndLoadCurrentFolder: () => string | null;
};

const VariablesContext = createContext<VariablesContextType | undefined>(
  undefined
);

interface VariablesProviderProps {
  children: ReactNode;
}

function VariablesProvider({ children }: VariablesProviderProps) {
  const [variables, setVariables] = useState<Variable[]>([
    { key: "", value: "", enabled: true }
  ]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  const getVariablesStorageKey = (folderName: string) => {
    return `solo-variables-${folderName}`;
  };

  // Auto-detect current folder from localStorage
  const detectAndLoadCurrentFolder = (): string | null => {
    // Get current request ID from sessionStorage if available
    const currentRequestKey = sessionStorage.getItem('current-request-folder');
    if (currentRequestKey) {
      loadVariablesForFolder(currentRequestKey);
      return currentRequestKey;
    }

    // Fallback: scan all folders to find any with files
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('solo-variables-') && !key.startsWith('update-')) {
        try {
          const files = JSON.parse(localStorage.getItem(key) || "[]");
          if (files.length > 0) {
            loadVariablesForFolder(key);
            return key;
          }
        } catch {
          continue;
        }
      }
    }

    return null;
  };

  // Load variables on component mount
  useEffect(() => {
    detectAndLoadCurrentFolder();
  }, []);

  const loadVariablesForFolder = (folderName: string) => {
    setCurrentFolder(folderName);
    // Store current folder in sessionStorage for persistence
    sessionStorage.setItem('current-request-folder', folderName);

    const storageKey = getVariablesStorageKey(folderName);
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsedVariables = JSON.parse(saved);
        setVariables(parsedVariables);
      } catch {
        setVariables([{ key: "", value: "", enabled: true }]);
      }
    } else {
      setVariables([{ key: "", value: "", enabled: true }]);
    }
  };

  const clearVariables = () => {
    setCurrentFolder(null);
    sessionStorage.removeItem('current-request-folder');
    setVariables([{ key: "", value: "", enabled: true }]);
  };

  const saveVariablesForFolder = (folderName: string, newVariables: Variable[]) => {
    const storageKey = getVariablesStorageKey(folderName);
    localStorage.setItem(storageKey, JSON.stringify(newVariables));
  };

  const updateVariables = (newVariables: Variable[]) => {
    setVariables(newVariables);

    if (currentFolder) {
      saveVariablesForFolder(currentFolder, newVariables);
    }
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

  const contextValue: VariablesContextType = {
    variables,
    setVariables: updateVariables,
    addVariable,
    removeVariable,
    updateVariable,
    replaceVariablesInUrl,
    currentFolder,
    loadVariablesForFolder,
    clearVariables,
    detectAndLoadCurrentFolder,
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

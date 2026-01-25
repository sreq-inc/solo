import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useToast } from "../hooks/useToast";
import type { Environment, EnvironmentSettings, EnvironmentVariable } from "../types/environment";

const STORAGE_KEY = "solo-environments";

interface EnvironmentContextType {
  environments: Environment[];
  activeEnvironment: Environment | null;
  loading: boolean;
  createEnvironment: (name: string, type?: "local" | "git-synced") => void;
  updateEnvironment: (id: string, updates: Partial<Environment>) => void;
  deleteEnvironment: (id: string) => void;
  duplicateEnvironment: (id: string) => void;
  setActiveEnvironment: (id: string) => void;
  renameEnvironment: (id: string, newName: string) => void;
  addVariable: (environmentId: string) => void;
  removeVariable: (environmentId: string, index: number) => void;
  updateVariable: (
    environmentId: string,
    index: number,
    field: keyof EnvironmentVariable,
    value: string | boolean
  ) => void;
  getEnvironmentVariables: (environmentId: string) => EnvironmentVariable[];
  replaceEnvironmentVariables: (text: string) => string;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

interface EnvironmentProviderProps {
  children: ReactNode;
}

export const EnvironmentProvider = ({ children }: EnvironmentProviderProps) => {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [activeEnvironment, setActiveEnvironmentState] = useState<Environment | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Load environments from localStorage on mount
  useEffect(() => {
    loadEnvironments();
  }, []);

  // Update activeEnvironment when environments change
  useEffect(() => {
    if (environments.length > 0) {
      const active = environments.find((env) => env.isActive);
      setActiveEnvironmentState(active || null);
    } else {
      setActiveEnvironmentState(null);
    }
  }, [environments]);

  const loadEnvironments = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const settings: EnvironmentSettings = JSON.parse(stored);
        setEnvironments(settings.environments || []);
      } else {
        // Create default "Local" environment on first run
        const defaultEnv = createDefaultEnvironment();
        const settings: EnvironmentSettings = {
          environments: [defaultEnv],
          activeEnvironmentId: defaultEnv.id,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        setEnvironments([defaultEnv]);
        toast.success("Created default 'Local' environment");
      }
    } catch (error) {
      console.error("Error loading environments:", error);
      toast.error("Failed to load environments");
    } finally {
      setLoading(false);
    }
  };

  const createDefaultEnvironment = (): Environment => {
    return {
      id: `env_${Date.now()}`,
      name: "Local",
      type: "local",
      isActive: true,
      variables: [{ key: "", value: "", enabled: true }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const saveEnvironments = (envs: Environment[]) => {
    const activeId = envs.find((env) => env.isActive)?.id || null;
    const settings: EnvironmentSettings = {
      environments: envs,
      activeEnvironmentId: activeId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setEnvironments(envs);
  };

  const createEnvironment = useCallback(
    (name: string, type: "local" | "git-synced" = "local") => {
      if (!name.trim()) {
        toast.warning("Environment name cannot be empty");
        return;
      }

      if (environments.some((env) => env.name === name.trim())) {
        toast.warning("An environment with this name already exists");
        return;
      }

      const newEnv: Environment = {
        id: `env_${Date.now()}`,
        name: name.trim(),
        type,
        isActive: false,
        variables: [{ key: "", value: "", enabled: true }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveEnvironments([...environments, newEnv]);
      toast.success(`Environment "${name}" created successfully`);
    },
    [environments, toast]
  );

  const updateEnvironment = useCallback(
    (id: string, updates: Partial<Environment>) => {
      const updated = environments.map((env) =>
        env.id === id ? { ...env, ...updates, updatedAt: new Date().toISOString() } : env
      );
      saveEnvironments(updated);
    },
    [environments]
  );

  const deleteEnvironment = useCallback(
    (id: string) => {
      const envToDelete = environments.find((env) => env.id === id);
      if (!envToDelete) {
        toast.error("Environment not found");
        return;
      }

      if (environments.length === 1) {
        toast.warning("Cannot delete the last environment");
        return;
      }

      const remaining = environments.filter((env) => env.id !== id);

      // If we're deleting the active environment, activate another one
      if (envToDelete.isActive && remaining.length > 0) {
        remaining[0].isActive = true;
      }

      saveEnvironments(remaining);
      toast.success(`Environment "${envToDelete.name}" deleted`);
    },
    [environments, toast]
  );

  const duplicateEnvironment = useCallback(
    (id: string) => {
      const envToDuplicate = environments.find((env) => env.id === id);
      if (!envToDuplicate) {
        toast.error("Environment not found");
        return;
      }

      const duplicatedEnv: Environment = {
        ...envToDuplicate,
        id: `env_${Date.now()}`,
        name: `${envToDuplicate.name} (Copy)`,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveEnvironments([...environments, duplicatedEnv]);
      toast.success(`Environment "${envToDuplicate.name}" duplicated`);
    },
    [environments, toast]
  );

  const setActiveEnvironment = useCallback(
    (id: string) => {
      const updated = environments.map((env) => ({
        ...env,
        isActive: env.id === id,
      }));
      saveEnvironments(updated);
      const newActive = updated.find((env) => env.id === id);
      if (newActive) {
        toast.success(`Switched to "${newActive.name}" environment`);
      }
    },
    [environments, toast]
  );

  const renameEnvironment = useCallback(
    (id: string, newName: string) => {
      if (!newName.trim()) {
        toast.warning("Environment name cannot be empty");
        return;
      }

      if (environments.some((env) => env.name === newName.trim() && env.id !== id)) {
        toast.warning("An environment with this name already exists");
        return;
      }

      updateEnvironment(id, { name: newName.trim() });
      toast.success("Environment renamed successfully");
    },
    [environments, updateEnvironment, toast]
  );

  const addVariable = useCallback(
    (environmentId: string) => {
      const env = environments.find((e) => e.id === environmentId);
      if (!env) return;

      const updatedVariables = [...env.variables, { key: "", value: "", enabled: true }];
      updateEnvironment(environmentId, { variables: updatedVariables });
    },
    [environments, updateEnvironment]
  );

  const removeVariable = useCallback(
    (environmentId: string, index: number) => {
      const env = environments.find((e) => e.id === environmentId);
      if (!env) return;

      const updatedVariables = env.variables.filter((_, i) => i !== index);
      // Ensure at least one empty variable row
      if (updatedVariables.length === 0) {
        updatedVariables.push({ key: "", value: "", enabled: true });
      }
      updateEnvironment(environmentId, { variables: updatedVariables });
    },
    [environments, updateEnvironment]
  );

  const updateVariable = useCallback(
    (
      environmentId: string,
      index: number,
      field: keyof EnvironmentVariable,
      value: string | boolean
    ) => {
      const env = environments.find((e) => e.id === environmentId);
      if (!env) return;

      const updatedVariables = env.variables.map((variable, i) =>
        i === index ? { ...variable, [field]: value } : variable
      );
      updateEnvironment(environmentId, { variables: updatedVariables });
    },
    [environments, updateEnvironment]
  );

  const getEnvironmentVariables = useCallback(
    (environmentId: string): EnvironmentVariable[] => {
      const env = environments.find((e) => e.id === environmentId);
      return env?.variables || [];
    },
    [environments]
  );

  const replaceEnvironmentVariables = useCallback(
    (text: string): string => {
      if (!activeEnvironment) return text;

      let processedText = text;
      const enabledVariables = activeEnvironment.variables.filter(
        (variable) => variable.enabled && variable.key.trim() !== "" && variable.value.trim() !== ""
      );

      enabledVariables.forEach((variable) => {
        const pattern = new RegExp(`\\{\\{\\s*${variable.key.trim()}\\s*\\}\\}`, "g");
        processedText = processedText.replace(pattern, variable.value.trim());
      });

      return processedText;
    },
    [activeEnvironment]
  );

  const value: EnvironmentContextType = {
    environments,
    activeEnvironment,
    loading,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    duplicateEnvironment,
    setActiveEnvironment,
    renameEnvironment,
    addVariable,
    removeVariable,
    updateVariable,
    getEnvironmentVariables,
    replaceEnvironmentVariables,
  };

  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
};

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error("useEnvironment must be used within an EnvironmentProvider");
  }
  return context;
};

export type EnvironmentType = "local" | "git-synced";

export interface Environment {
  id: string;
  name: string;
  type: EnvironmentType;
  isActive: boolean;
  variables: EnvironmentVariable[];
  createdAt: string;
  updatedAt: string;
}

export interface EnvironmentVariable {
  key: string;
  value: string;
  enabled: boolean;
}

export interface EnvironmentSettings {
  environments: Environment[];
  activeEnvironmentId: string | null;
}

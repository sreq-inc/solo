export type ImportFormat = "postman" | "insomnia" | "solo";

export type ConflictResolution = "replace" | "keep_both" | "skip";

export type ImportedCollection = {
  name: string;
  requestCount: number;
  variableCount: number;
  hasConflict: boolean;
};

export type ImportResult = {
  success: boolean;
  collections: ImportedCollection[];
  totalRequests: number;
  totalVariables: number;
  errors?: string[];
};

export type ImportState = {
  isImporting: boolean;
  progress: number;
  currentFile: string | null;
  error: string | null;
  result: ImportResult | null;
};

export type ImportConflict = {
  folderName: string;
  existingRequestCount: number;
  newRequestCount: number;
  resolution: ConflictResolution;
};

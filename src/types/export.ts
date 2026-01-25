export type ExportFormat = "solo" | "postman" | "insomnia";

export type ExportOptions = {
  format: ExportFormat;
  includeVariables: boolean;
  includeDescriptions: boolean;
  selectedFolders?: string[];
  exportAll?: boolean;
};

export type ExportState = {
  isExporting: boolean;
  progress: number;
  error: string | null;
};

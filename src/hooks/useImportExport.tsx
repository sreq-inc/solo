import { useCallback, useState } from "react";
import type { ExportOptions, ExportState } from "../types/export";
import { useToast } from "./useToast";

export const useImportExport = () => {
  const toast = useToast();
  const [exportState, setExportState] = useState<ExportState>({
    isExporting: false,
    progress: 0,
    error: null,
  });

  const exportData = useCallback(
    async (options: ExportOptions) => {
      setExportState({
        isExporting: true,
        progress: 0,
        error: null,
      });

      try {
        const data: any = {};

        // Determine which folders to export
        const foldersToExport: string[] = [];

        if (options.exportAll) {
          // Export all folders
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !key.startsWith("solo-variables-") && !key.startsWith("update-")) {
              foldersToExport.push(key);
            }
          }
        } else if (options.selectedFolders) {
          foldersToExport.push(...options.selectedFolders);
        }

        setExportState((prev) => ({ ...prev, progress: 30 }));

        // Export folders
        for (const folder of foldersToExport) {
          const folderData = localStorage.getItem(folder);
          if (folderData) {
            data[folder] = JSON.parse(folderData);

            // Include variables if requested
            if (options.includeVariables) {
              const variablesKey = `solo-variables-${folder}`;
              const variables = localStorage.getItem(variablesKey);
              if (variables) {
                data[variablesKey] = JSON.parse(variables);
              }
            }
          }
        }

        setExportState((prev) => ({ ...prev, progress: 60 }));

        // Add metadata
        const exportData = {
          soloVersion: "1.0.0",
          exportDate: new Date().toISOString(),
          format: options.format,
          ...data,
        };

        const jsonString = JSON.stringify(exportData, null, 2);

        setExportState((prev) => ({ ...prev, progress: 80 }));

        // Create download using browser download API
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `solo-export-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setExportState({
          isExporting: false,
          progress: 100,
          error: null,
        });
        toast.success("Export completed successfully!");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to export data";
        setExportState({
          isExporting: false,
          progress: 0,
          error: errorMessage,
        });
        toast.error(errorMessage);
      }
    },
    [toast]
  );

  const importFromFile = useCallback(async () => {
    // This is handled by the ImportContext
    // This function is here for consistency
    return;
  }, []);

  return {
    exportData,
    exportState,
    importFromFile,
  };
};

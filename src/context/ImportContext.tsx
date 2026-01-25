import { invoke } from "@tauri-apps/api/core";
import { createContext, type ReactNode, useCallback, useContext, useState } from "react";
import { useToast } from "../hooks/useToast";
import type {
  ConflictResolution,
  ImportConflict,
  ImportFormat,
  ImportState,
} from "../types/import";

type ImportContextType = {
  importState: ImportState;
  conflicts: ImportConflict[];
  importFile: (file: File) => Promise<void>;
  resolveConflict: (folderName: string, resolution: ConflictResolution) => void;
  finalizeImport: () => Promise<void>;
  cancelImport: () => void;
  resetImport: () => void;
};

const ImportContext = createContext<ImportContextType | undefined>(undefined);

export const ImportProvider = ({ children }: { children: ReactNode }) => {
  const toast = useToast();

  const [importState, setImportState] = useState<ImportState>({
    isImporting: false,
    progress: 0,
    currentFile: null,
    error: null,
    result: null,
  });

  const [conflicts, setConflicts] = useState<ImportConflict[]>([]);
  const [parsedData, setParsedData] = useState<any>(null);

  const detectFormat = (data: any): ImportFormat => {
    if (data.info?.schema?.includes("postman")) return "postman";
    if (data._type === "export" && data.__export_format) return "insomnia";
    if (data.soloVersion || data.folders) return "solo";
    return "solo";
  };

  const importFile = useCallback(
    async (file: File) => {
      setImportState({
        isImporting: true,
        progress: 10,
        currentFile: file.name,
        error: null,
        result: null,
      });

      try {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("File size exceeds 10MB limit");
        }

        // Read file content
        const content = await file.text();
        const data = JSON.parse(content);

        setImportState((prev) => ({ ...prev, progress: 30 }));

        // Detect format
        const format = detectFormat(data);

        setImportState((prev) => ({ ...prev, progress: 50 }));

        // Parse data based on format
        let parsedCollections;
        try {
          parsedCollections = await invoke<string>("parse_import_file", {
            content,
            format,
          });
          const parsed = JSON.parse(parsedCollections);
          setParsedData(parsed);

          // Check for conflicts
          const detectedConflicts: ImportConflict[] = [];
          for (const collection of parsed.collections || []) {
            const existingData = localStorage.getItem(collection.name);
            if (existingData) {
              const existing = JSON.parse(existingData);
              detectedConflicts.push({
                folderName: collection.name,
                existingRequestCount: existing.length || 0,
                newRequestCount: collection.requests?.length || 0,
                resolution: "keep_both",
              });
            }
          }

          setConflicts(detectedConflicts);
          setImportState((prev) => ({
            ...prev,
            progress: 100,
            isImporting: false,
            result: {
              success: true,
              collections: parsed.collections?.map((c: any) => ({
                name: c.name,
                requestCount: c.requests?.length || 0,
                variableCount: c.variables?.length || 0,
                hasConflict: detectedConflicts.some((conflict) => conflict.folderName === c.name),
              })),
              totalRequests:
                parsed.collections?.reduce(
                  (sum: number, c: any) => sum + (c.requests?.length || 0),
                  0
                ) || 0,
              totalVariables:
                parsed.collections?.reduce(
                  (sum: number, c: any) => sum + (c.variables?.length || 0),
                  0
                ) || 0,
            },
          }));
        } catch (_error) {
          // Fallback to client-side parsing if backend command doesn't exist
          console.warn("Backend import not available, using client-side parsing");
          setParsedData(data);

          const detectedConflicts: ImportConflict[] = [];
          const collections = Object.keys(data).filter((key) => !key.startsWith("solo-variables-"));

          for (const folderName of collections) {
            const existingData = localStorage.getItem(folderName);
            if (existingData) {
              const existing = JSON.parse(existingData);
              const newData = data[folderName];
              detectedConflicts.push({
                folderName,
                existingRequestCount: existing.length || 0,
                newRequestCount: newData?.length || 0,
                resolution: "keep_both",
              });
            }
          }

          setConflicts(detectedConflicts);
          setImportState((prev) => ({
            ...prev,
            progress: 100,
            isImporting: false,
            result: {
              success: true,
              collections: collections.map((name) => ({
                name,
                requestCount: data[name]?.length || 0,
                variableCount: data[`solo-variables-${name}`]?.length || 0,
                hasConflict: detectedConflicts.some((conflict) => conflict.folderName === name),
              })),
              totalRequests: collections.reduce((sum, name) => sum + (data[name]?.length || 0), 0),
              totalVariables: collections.reduce(
                (sum, name) => sum + (data[`solo-variables-${name}`]?.length || 0),
                0
              ),
            },
          }));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to import file";
        setImportState({
          isImporting: false,
          progress: 0,
          currentFile: null,
          error: errorMessage,
          result: null,
        });
        toast.error(errorMessage);
      }
    },
    [toast]
  );

  const resolveConflict = useCallback((folderName: string, resolution: ConflictResolution) => {
    setConflicts((prev) =>
      prev.map((conflict) =>
        conflict.folderName === folderName ? { ...conflict, resolution } : conflict
      )
    );
  }, []);

  const finalizeImport = useCallback(async () => {
    if (!parsedData || !importState.result) {
      toast.error("No data to import");
      return;
    }

    try {
      setImportState((prev) => ({ ...prev, isImporting: true, progress: 0 }));

      // Import each collection
      const collections =
        parsedData.collections ||
        Object.keys(parsedData).filter((key) => !key.startsWith("solo-variables-"));

      let imported = 0;
      for (const collection of collections) {
        const folderName = typeof collection === "string" ? collection : collection.name;
        const conflict = conflicts.find((c) => c.folderName === folderName);

        let finalFolderName = folderName;

        if (conflict) {
          if (conflict.resolution === "skip") {
            imported++;
            continue;
          }
          if (conflict.resolution === "keep_both") {
            finalFolderName = `${folderName} (Imported)`;
          }
          // For "replace", we just use the same name
        }

        // Create or update folder
        const requests =
          typeof collection === "string" ? parsedData[collection] : collection.requests;
        const variables =
          typeof collection === "string"
            ? parsedData[`solo-variables-${collection}`]
            : collection.variables;

        localStorage.setItem(finalFolderName, JSON.stringify(requests || []));

        if (variables && variables.length > 0) {
          localStorage.setItem(`solo-variables-${finalFolderName}`, JSON.stringify(variables));
        }

        imported++;
        setImportState((prev) => ({
          ...prev,
          progress: Math.floor((imported / collections.length) * 100),
        }));
      }

      // Reload the page to refresh all data
      window.location.reload();

      toast.success("Import completed successfully!");
      resetImport();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to finalize import";
      toast.error(errorMessage);
      setImportState((prev) => ({
        ...prev,
        isImporting: false,
        error: errorMessage,
      }));
    }
  }, [parsedData, importState.result, conflicts, toast]);

  const cancelImport = useCallback(() => {
    resetImport();
  }, []);

  const resetImport = useCallback(() => {
    setImportState({
      isImporting: false,
      progress: 0,
      currentFile: null,
      error: null,
      result: null,
    });
    setConflicts([]);
    setParsedData(null);
  }, []);

  return (
    <ImportContext.Provider
      value={{
        importState,
        conflicts,
        importFile,
        resolveConflict,
        finalizeImport,
        cancelImport,
        resetImport,
      }}
    >
      {children}
    </ImportContext.Provider>
  );
};

export const useImport = () => {
  const context = useContext(ImportContext);
  if (context === undefined) {
    throw new Error("useImport must be used within an ImportProvider");
  }
  return context;
};

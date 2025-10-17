import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useRequestStorage } from "./useRequestStorage";

describe("useRequestStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("createFolder", () => {
    it("should create a new folder", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        const success = result.current.createFolder("my-project");
        expect(success).toBe(true);
      });

      expect(result.current.folders).toHaveProperty("my-project");
      expect(result.current.folders["my-project"]).toEqual([]);
      expect(localStorage.getItem("my-project")).toBe("[]");
    });

    it("should not create folder with empty name", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        const success = result.current.createFolder("");
        expect(success).toBe(false);
      });

      expect(Object.keys(result.current.folders)).toHaveLength(0);
    });

    it("should not create duplicate folder", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.createFolder("my-project");
      });

      act(() => {
        const success = result.current.createFolder("my-project");
        expect(success).toBe(false);
      });

      expect(Object.keys(result.current.folders)).toHaveLength(1);
    });

    it("should create multiple folders", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.createFolder("project-1");
        result.current.createFolder("project-2");
      });

      expect(result.current.folders).toHaveProperty("project-1");
      expect(result.current.folders).toHaveProperty("project-2");
    });
  });

  describe("removeFolder", () => {
    it("should remove existing folder", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.createFolder("my-project");
      });

      expect(result.current.folders).toHaveProperty("my-project");

      act(() => {
        result.current.removeFolder("my-project");
      });

      expect(result.current.folders).not.toHaveProperty("my-project");
      expect(localStorage.getItem("my-project")).toBeNull();
    });

    it("should handle removing non-existent folder", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.removeFolder("non-existent");
      });

      expect(Object.keys(result.current.folders)).toHaveLength(0);
    });

    it("should remove only specified folder", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.createFolder("project-1");
        result.current.createFolder("project-2");
      });

      act(() => {
        result.current.removeFolder("project-1");
      });

      expect(result.current.folders).not.toHaveProperty("project-1");
      expect(result.current.folders).toHaveProperty("project-2");
    });
  });

  describe("saveRequest", () => {
    it("should save new request to folder", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.createFolder("my-project");
      });

      const requestData = {
        method: "GET" as const,
        url: "https://api.example.com/users",
      };

      act(() => {
        result.current.saveRequest("my-project", requestData, "get-users");
      });

      expect(result.current.folders["my-project"]).toContain("get-users");

      const stored = JSON.parse(localStorage.getItem("my-project") || "[]");
      expect(stored).toHaveLength(1);
      expect(stored[0].fileName).toBe("get-users");
      expect(stored[0].fileData).toEqual(requestData);
    });

    it("should update existing request", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.createFolder("my-project");
      });

      const requestData = {
        method: "GET" as const,
        url: "https://api.example.com/users",
      };

      act(() => {
        result.current.saveRequest("my-project", requestData, "get-users");
      });

      const updatedData = {
        method: "POST" as const,
        url: "https://api.example.com/users",
        payload: '{"name":"John"}',
      };

      act(() => {
        result.current.saveRequest("my-project", updatedData, "get-users");
      });

      const stored = JSON.parse(localStorage.getItem("my-project") || "[]");
      expect(stored).toHaveLength(1);
      expect(stored[0].fileData).toEqual(updatedData);
    });

    it("should save multiple requests to same folder", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.createFolder("my-project");
      });

      act(() => {
        result.current.saveRequest(
          "my-project",
          { method: "GET", url: "https://api.example.com/users" },
          "get-users"
        );
        result.current.saveRequest(
          "my-project",
          { method: "POST", url: "https://api.example.com/users" },
          "create-user"
        );
      });

      expect(result.current.folders["my-project"]).toHaveLength(2);
      expect(result.current.folders["my-project"]).toContain("get-users");
      expect(result.current.folders["my-project"]).toContain("create-user");
    });

    it("should save request with all fields", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.createFolder("my-project");
      });

      const requestData = {
        method: "POST" as const,
        url: "https://api.example.com/users",
        payload: '{"name":"John"}',
        useBasicAuth: true,
        username: "admin",
        password: "secret",
        bearerToken: "token123",
        activeTab: "body" as const,
      };

      act(() => {
        result.current.saveRequest("my-project", requestData, "create-user");
      });

      const stored = JSON.parse(localStorage.getItem("my-project") || "[]");
      expect(stored[0].fileData).toEqual(requestData);
    });
  });

  describe("removeRequest", () => {
    it("should remove request from folder", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.createFolder("my-project");
        result.current.saveRequest(
          "my-project",
          { method: "GET", url: "https://api.example.com/users" },
          "get-users"
        );
      });

      expect(result.current.folders["my-project"]).toContain("get-users");

      act(() => {
        result.current.removeRequest("my-project", "get-users");
      });

      expect(result.current.folders["my-project"]).not.toContain("get-users");
      expect(result.current.folders["my-project"]).toHaveLength(0);
    });

    it("should remove only specified request", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.createFolder("my-project");
        result.current.saveRequest(
          "my-project",
          { method: "GET", url: "https://api.example.com/users" },
          "get-users"
        );
        result.current.saveRequest(
          "my-project",
          { method: "POST", url: "https://api.example.com/users" },
          "create-user"
        );
      });

      act(() => {
        result.current.removeRequest("my-project", "get-users");
      });

      expect(result.current.folders["my-project"]).not.toContain("get-users");
      expect(result.current.folders["my-project"]).toContain("create-user");
    });

    it("should handle removing non-existent request", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.createFolder("my-project");
      });

      act(() => {
        result.current.removeRequest("my-project", "non-existent");
      });

      expect(result.current.folders["my-project"]).toHaveLength(0);
    });
  });

  describe("loadRequest", () => {
    it("should load request from specific folder", () => {
      const { result } = renderHook(() => useRequestStorage());

      const requestData = {
        method: "GET" as const,
        url: "https://api.example.com/users",
      };

      act(() => {
        result.current.createFolder("my-project");
        result.current.saveRequest("my-project", requestData, "get-users");
      });

      let loaded;
      act(() => {
        loaded = result.current.loadRequest("my-project", "get-users");
      });

      expect(loaded).toEqual(requestData);
    });

    it("should return null for non-existent request", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.createFolder("my-project");
      });

      let loaded;
      act(() => {
        loaded = result.current.loadRequest("my-project", "non-existent");
      });

      expect(loaded).toBeNull();
    });

    it("should search all folders when folder is null", () => {
      const { result } = renderHook(() => useRequestStorage());

      const requestData = {
        method: "GET" as const,
        url: "https://api.example.com/users",
      };

      act(() => {
        result.current.createFolder("project-1");
        result.current.createFolder("project-2");
        result.current.saveRequest("project-2", requestData, "get-users");
      });

      let loaded;
      act(() => {
        loaded = result.current.loadRequest(null, "get-users");
      });

      expect(loaded).toEqual(requestData);
    });

    it("should return null when searching all folders and request not found", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.createFolder("project-1");
      });

      let loaded;
      act(() => {
        loaded = result.current.loadRequest(null, "non-existent");
      });

      expect(loaded).toBeNull();
    });
  });

  describe("loadAllFolders", () => {
    it("should load all folders from localStorage", () => {
      localStorage.setItem(
        "project-1",
        JSON.stringify([
          {
            fileName: "get-users",
            fileData: { method: "GET", url: "https://api.example.com/users" },
          },
        ])
      );
      localStorage.setItem(
        "project-2",
        JSON.stringify([
          {
            fileName: "create-post",
            fileData: { method: "POST", url: "https://api.example.com/posts" },
          },
        ])
      );

      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.loadAllFolders();
      });

      expect(result.current.folders).toHaveProperty("project-1");
      expect(result.current.folders).toHaveProperty("project-2");
      expect(result.current.folders["project-1"]).toEqual(["get-users"]);
      expect(result.current.folders["project-2"]).toEqual(["create-post"]);
    });

    it("should handle invalid JSON in localStorage", () => {
      localStorage.setItem("valid-project", JSON.stringify([{ fileName: "test", fileData: {} }]));
      localStorage.setItem("invalid-project", "invalid-json");

      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.loadAllFolders();
      });

      expect(result.current.folders).toHaveProperty("valid-project");
      expect(result.current.folders).not.toHaveProperty("invalid-project");
    });

    it("should load empty folders", () => {
      localStorage.setItem("empty-project", JSON.stringify([]));

      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.loadAllFolders();
      });

      expect(result.current.folders).toHaveProperty("empty-project");
      expect(result.current.folders["empty-project"]).toEqual([]);
    });
  });

  describe("getFolderRequests", () => {
    it("should get all requests from folder", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.createFolder("my-project");
        result.current.saveRequest(
          "my-project",
          { method: "GET", url: "https://api.example.com/users" },
          "get-users"
        );
        result.current.saveRequest(
          "my-project",
          { method: "POST", url: "https://api.example.com/users" },
          "create-user"
        );
      });

      let requests;
      act(() => {
        requests = result.current.getFolderRequests("my-project");
      });

      expect(requests).toHaveLength(2);
      expect(requests?.[0]?.fileName).toBe("get-users");
      expect(requests?.[1]?.fileName).toBe("create-user");
    });

    it("should return empty array for non-existent folder", () => {
      const { result } = renderHook(() => useRequestStorage());

      let requests;
      act(() => {
        requests = result.current.getFolderRequests("non-existent");
      });

      expect(requests).toEqual([]);
    });

    it("should handle invalid JSON", () => {
      localStorage.setItem("invalid-folder", "invalid-json");

      const { result } = renderHook(() => useRequestStorage());

      let requests;
      act(() => {
        requests = result.current.getFolderRequests("invalid-folder");
      });

      expect(requests).toEqual([]);
    });
  });

  describe("currentFolder", () => {
    it("should set and get current folder", () => {
      const { result } = renderHook(() => useRequestStorage());

      expect(result.current.currentFolder).toBe("");

      act(() => {
        result.current.setCurrentFolder("my-project");
      });

      expect(result.current.currentFolder).toBe("my-project");
    });

    it("should update current folder", () => {
      const { result } = renderHook(() => useRequestStorage());

      act(() => {
        result.current.setCurrentFolder("project-1");
      });

      expect(result.current.currentFolder).toBe("project-1");

      act(() => {
        result.current.setCurrentFolder("project-2");
      });

      expect(result.current.currentFolder).toBe("project-2");
    });
  });
});

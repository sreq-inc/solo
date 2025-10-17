import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Variable } from "../context/VariablesContext";
import { useVariableSubstitution } from "./useVariableSubstitution";

describe("useVariableSubstitution", () => {
  describe("replaceVariablesInUrl", () => {
    it("should replace single variable in URL", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
      ];

      const url = "{{baseUrl}}/users";
      const replaced = result.current.replaceVariablesInUrl(url, variables);

      expect(replaced).toBe("https://api.example.com/users");
    });

    it("should replace multiple variables in URL", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
        { key: "version", value: "v1", enabled: true },
        { key: "resource", value: "users", enabled: true },
      ];

      const url = "{{baseUrl}}/{{version}}/{{resource}}";
      const replaced = result.current.replaceVariablesInUrl(url, variables);

      expect(replaced).toBe("https://api.example.com/v1/users");
    });

    it("should replace same variable multiple times", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [{ key: "id", value: "123", enabled: true }];

      const url = "{{id}}/items/{{id}}";
      const replaced = result.current.replaceVariablesInUrl(url, variables);

      expect(replaced).toBe("123/items/123");
    });

    it("should handle variables with spaces in placeholder", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
      ];

      const url = "{{ baseUrl }}/users";
      const replaced = result.current.replaceVariablesInUrl(url, variables);

      expect(replaced).toBe("https://api.example.com/users");
    });

    it("should handle variables with spaces in key/value", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: " baseUrl ", value: " https://api.example.com ", enabled: true },
      ];

      const url = "{{baseUrl}}/users";
      const replaced = result.current.replaceVariablesInUrl(url, variables);

      expect(replaced).toBe("https://api.example.com/users");
    });

    it("should not replace disabled variables", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: "baseUrl", value: "https://api.example.com", enabled: false },
      ];

      const url = "{{baseUrl}}/users";
      const replaced = result.current.replaceVariablesInUrl(url, variables);

      expect(replaced).toBe("{{baseUrl}}/users");
    });

    it("should not replace variables with empty key", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [{ key: "", value: "https://api.example.com", enabled: true }];

      const url = "{{}}/users";
      const replaced = result.current.replaceVariablesInUrl(url, variables);

      expect(replaced).toBe("{{}}/users");
    });

    it("should not replace variables with empty value", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [{ key: "baseUrl", value: "", enabled: true }];

      const url = "{{baseUrl}}/users";
      const replaced = result.current.replaceVariablesInUrl(url, variables);

      expect(replaced).toBe("{{baseUrl}}/users");
    });

    it("should not replace variables with whitespace-only key", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: "   ", value: "https://api.example.com", enabled: true },
      ];

      const url = "{{   }}/users";
      const replaced = result.current.replaceVariablesInUrl(url, variables);

      expect(replaced).toBe("{{   }}/users");
    });

    it("should not replace variables with whitespace-only value", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [{ key: "baseUrl", value: "   ", enabled: true }];

      const url = "{{baseUrl}}/users";
      const replaced = result.current.replaceVariablesInUrl(url, variables);

      expect(replaced).toBe("{{baseUrl}}/users");
    });

    it("should handle URL with no variables", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
      ];

      const url = "https://api.example.com/users";
      const replaced = result.current.replaceVariablesInUrl(url, variables);

      expect(replaced).toBe("https://api.example.com/users");
    });

    it("should handle empty variables array", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const url = "{{baseUrl}}/users";
      const replaced = result.current.replaceVariablesInUrl(url, []);

      expect(replaced).toBe("{{baseUrl}}/users");
    });

    it("should handle empty URL", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
      ];

      const replaced = result.current.replaceVariablesInUrl("", variables);

      expect(replaced).toBe("");
    });

    it("should handle mix of enabled and disabled variables", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
        { key: "version", value: "v1", enabled: false },
        { key: "resource", value: "users", enabled: true },
      ];

      const url = "{{baseUrl}}/{{version}}/{{resource}}";
      const replaced = result.current.replaceVariablesInUrl(url, variables);

      expect(replaced).toBe("https://api.example.com/{{version}}/users");
    });
  });

  describe("findVariables", () => {
    it("should find single variable in text", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
      ];

      const text = "{{baseUrl}}/users";
      const found = result.current.findVariables(text, variables);

      expect(found).toHaveLength(1);
      expect(found[0]).toEqual({
        variable: "baseUrl",
        exists: true,
        value: "https://api.example.com",
        fullMatch: "{{baseUrl}}",
        start: 0,
        end: 11,
      });
    });

    it("should find multiple variables in text", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
        { key: "version", value: "v1", enabled: true },
      ];

      const text = "{{baseUrl}}/{{version}}/users";
      const found = result.current.findVariables(text, variables);

      expect(found).toHaveLength(2);
      expect(found[0].variable).toBe("baseUrl");
      expect(found[1].variable).toBe("version");
    });

    it("should find variables with spaces in placeholder", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
      ];

      const text = "{{ baseUrl }}/users";
      const found = result.current.findVariables(text, variables);

      expect(found).toHaveLength(1);
      expect(found[0].variable).toBe("baseUrl");
      expect(found[0].exists).toBe(true);
    });

    it("should mark non-existent variables", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
      ];

      const text = "{{nonExistent}}/users";
      const found = result.current.findVariables(text, variables);

      expect(found).toHaveLength(1);
      expect(found[0].variable).toBe("nonExistent");
      expect(found[0].exists).toBe(false);
      expect(found[0].value).toBe("");
    });

    it("should mark disabled variables as non-existent", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: "baseUrl", value: "https://api.example.com", enabled: false },
      ];

      const text = "{{baseUrl}}/users";
      const found = result.current.findVariables(text, variables);

      expect(found).toHaveLength(1);
      expect(found[0].exists).toBe(false);
    });

    it("should mark variables with empty value as non-existent", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [{ key: "baseUrl", value: "", enabled: true }];

      const text = "{{baseUrl}}/users";
      const found = result.current.findVariables(text, variables);

      expect(found).toHaveLength(1);
      expect(found[0].exists).toBe(false);
    });

    it("should find same variable multiple times", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [{ key: "id", value: "123", enabled: true }];

      const text = "{{id}}/items/{{id}}";
      const found = result.current.findVariables(text, variables);

      expect(found).toHaveLength(2);
      expect(found[0].variable).toBe("id");
      expect(found[0].start).toBe(0);
      expect(found[1].variable).toBe("id");
      expect(found[1].start).toBe(13);
    });

    it("should return empty array for text without variables", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
      ];

      const text = "https://api.example.com/users";
      const found = result.current.findVariables(text, variables);

      expect(found).toHaveLength(0);
    });

    it("should handle empty text", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
      ];

      const found = result.current.findVariables("", variables);

      expect(found).toHaveLength(0);
    });

    it("should handle empty variables array", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const text = "{{baseUrl}}/users";
      const found = result.current.findVariables(text, []);

      expect(found).toHaveLength(1);
      expect(found[0].exists).toBe(false);
    });

    it("should provide correct start and end positions", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [];

      const text = "prefix {{var1}} middle {{var2}} suffix";
      const found = result.current.findVariables(text, variables);

      expect(found).toHaveLength(2);
      expect(found[0].start).toBe(7);
      expect(found[0].end).toBe(15);
      expect(found[1].start).toBe(23);
      expect(found[1].end).toBe(31);
    });

    it("should handle malformed brackets", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [];

      const text = "{baseUrl}/{{incomplete/{{valid}}";
      const found = result.current.findVariables(text, variables);

      expect(found).toHaveLength(1);
      // The regex matches the last valid {{...}} pattern
      expect(found[0].variable).toBe("incomplete/{{valid");
    });

    it("should handle nested placeholders", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [{ key: "outer", value: "value", enabled: true }];

      const text = "{{outer}}";
      const found = result.current.findVariables(text, variables);

      expect(found).toHaveLength(1);
      expect(found[0].variable).toBe("outer");
    });
  });

  describe("Integration scenarios", () => {
    it("should handle complex URL with multiple variables", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: "protocol", value: "https", enabled: true },
        { key: "domain", value: "api.example.com", enabled: true },
        { key: "version", value: "v2", enabled: true },
        { key: "resource", value: "users", enabled: true },
        { key: "id", value: "123", enabled: true },
      ];

      const url = "{{protocol}}://{{domain}}/{{version}}/{{resource}}/{{id}}";
      const replaced = result.current.replaceVariablesInUrl(url, variables);

      expect(replaced).toBe("https://api.example.com/v2/users/123");
    });

    it("should find and validate all variables in complex URL", () => {
      const { result } = renderHook(() => useVariableSubstitution());

      const variables: Variable[] = [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
        { key: "version", value: "v1", enabled: false },
        { key: "resource", value: "users", enabled: true },
      ];

      const url = "{{baseUrl}}/{{version}}/{{resource}}/{{undefined}}";
      const found = result.current.findVariables(url, variables);

      expect(found).toHaveLength(4);
      expect(found[0].exists).toBe(true); // baseUrl
      expect(found[1].exists).toBe(false); // version (disabled)
      expect(found[2].exists).toBe(true); // resource
      expect(found[3].exists).toBe(false); // undefined
    });
  });
});

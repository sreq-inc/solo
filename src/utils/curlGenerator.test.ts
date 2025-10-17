import { describe, expect, it, vi } from "vitest";
import { generateCurl } from "./curlGenerator";

describe("curlGenerator", () => {
  describe("HTTP requests", () => {
    it("should generate basic GET request", () => {
      const result = generateCurl({
        method: "GET",
        url: "https://api.example.com/users",
      });

      expect(result).toBe('curl -X GET "https://api.example.com/users"');
    });

    it("should generate POST request with payload", () => {
      const result = generateCurl({
        method: "POST",
        url: "https://api.example.com/users",
        payload: '{"name":"John"}',
      });

      expect(result).toContain("curl -X POST");
      expect(result).toContain("https://api.example.com/users");
      expect(result).toContain('-H "Content-Type: application/json"');
      expect(result).toContain('-d "{\\"name\\":\\"John\\"}"');
    });

    it("should generate PUT request with payload", () => {
      const result = generateCurl({
        method: "PUT",
        url: "https://api.example.com/users/1",
        payload: '{"name":"Jane"}',
      });

      expect(result).toContain("curl -X PUT");
      expect(result).toContain('-d "{\\"name\\":\\"Jane\\"}"');
    });

    it("should generate PATCH request with payload", () => {
      const result = generateCurl({
        method: "PATCH",
        url: "https://api.example.com/users/1",
        payload: '{"status":"active"}',
      });

      expect(result).toContain("curl -X PATCH");
      expect(result).toContain('-d "{\\"status\\":\\"active\\"}"');
    });

    it("should generate DELETE request", () => {
      const result = generateCurl({
        method: "DELETE",
        url: "https://api.example.com/users/1",
      });

      expect(result).toBe('curl -X DELETE "https://api.example.com/users/1"');
    });

    it("should not add payload for GET requests", () => {
      const result = generateCurl({
        method: "GET",
        url: "https://api.example.com/users",
        payload: '{"should":"ignore"}',
      });

      expect(result).not.toContain("-d");
    });
  });

  describe("Authentication", () => {
    it("should add Basic Auth", () => {
      const result = generateCurl({
        method: "GET",
        url: "https://api.example.com/users",
        useBasicAuth: true,
        username: "admin",
        password: "secret123",
      });

      expect(result).toContain('-u "admin:secret123"');
    });

    it("should add Basic Auth without password", () => {
      const result = generateCurl({
        method: "GET",
        url: "https://api.example.com/users",
        useBasicAuth: true,
        username: "admin",
      });

      expect(result).toContain('-u "admin:"');
    });

    it("should add Bearer token", () => {
      const result = generateCurl({
        method: "GET",
        url: "https://api.example.com/users",
        bearerToken: "token123",
      });

      expect(result).toContain('-H "Authorization: Bearer token123"');
    });

    it("should not add Bearer token if empty", () => {
      const result = generateCurl({
        method: "GET",
        url: "https://api.example.com/users",
        bearerToken: "  ",
      });

      expect(result).not.toContain("Authorization");
    });

    it("should add both Basic Auth and Bearer token", () => {
      const result = generateCurl({
        method: "GET",
        url: "https://api.example.com/users",
        useBasicAuth: true,
        username: "admin",
        password: "secret",
        bearerToken: "token123",
      });

      expect(result).toContain('-u "admin:secret"');
      expect(result).toContain('-H "Authorization: Bearer token123"');
    });
  });

  describe("Query Parameters", () => {
    it("should add single query parameter", () => {
      const result = generateCurl({
        method: "GET",
        url: "https://api.example.com/users",
        queryParams: [{ key: "page", value: "1", enabled: true }],
      });

      expect(result).toContain("https://api.example.com/users?page=1");
    });

    it("should add multiple query parameters", () => {
      const result = generateCurl({
        method: "GET",
        url: "https://api.example.com/users",
        queryParams: [
          { key: "page", value: "1", enabled: true },
          { key: "limit", value: "10", enabled: true },
        ],
      });

      expect(result).toContain("page=1&limit=10");
    });

    it("should ignore disabled query parameters", () => {
      const result = generateCurl({
        method: "GET",
        url: "https://api.example.com/users",
        queryParams: [
          { key: "page", value: "1", enabled: true },
          { key: "limit", value: "10", enabled: false },
        ],
      });

      expect(result).toContain("page=1");
      expect(result).not.toContain("limit");
    });

    it("should ignore empty query parameters", () => {
      const result = generateCurl({
        method: "GET",
        url: "https://api.example.com/users",
        queryParams: [
          { key: "", value: "1", enabled: true },
          { key: "page", value: "", enabled: true },
        ],
      });

      expect(result).toBe('curl -X GET "https://api.example.com/users"');
    });

    it("should encode special characters in query parameters", () => {
      const result = generateCurl({
        method: "GET",
        url: "https://api.example.com/users",
        queryParams: [
          { key: "name", value: "John Doe", enabled: true },
          { key: "email", value: "test@example.com", enabled: true },
        ],
      });

      expect(result).toContain("name=John%20Doe");
      expect(result).toContain("email=test%40example.com");
    });

    it("should replace existing query string with new parameters", () => {
      const result = generateCurl({
        method: "GET",
        url: "https://api.example.com/users?old=value",
        queryParams: [{ key: "new", value: "param", enabled: true }],
      });

      expect(result).toContain("https://api.example.com/users?new=param");
      expect(result).not.toContain("old=value");
    });
  });

  describe("Variable Substitution", () => {
    it("should replace variables in URL", () => {
      sessionStorage.setItem("current-request-folder", "test-folder");
      localStorage.setItem(
        "solo-variables-test-folder",
        JSON.stringify([{ key: "baseUrl", value: "https://api.example.com", enabled: true }])
      );

      const result = generateCurl({
        method: "GET",
        url: "{{baseUrl}}/users",
      });

      expect(result).toContain("https://api.example.com/users");
    });

    it("should replace multiple variables", () => {
      sessionStorage.setItem("current-request-folder", "test-folder");
      localStorage.setItem(
        "solo-variables-test-folder",
        JSON.stringify([
          { key: "baseUrl", value: "https://api.example.com", enabled: true },
          { key: "version", value: "v1", enabled: true },
        ])
      );

      const result = generateCurl({
        method: "GET",
        url: "{{baseUrl}}/{{version}}/users",
      });

      expect(result).toContain("https://api.example.com/v1/users");
    });

    it("should handle variables with spaces", () => {
      sessionStorage.setItem("current-request-folder", "test-folder");
      localStorage.setItem(
        "solo-variables-test-folder",
        JSON.stringify([{ key: "baseUrl", value: "https://api.example.com", enabled: true }])
      );

      const result = generateCurl({
        method: "GET",
        url: "{{ baseUrl }}/users",
      });

      expect(result).toContain("https://api.example.com/users");
    });

    it("should not replace disabled variables", () => {
      sessionStorage.setItem("current-request-folder", "test-folder");
      localStorage.setItem(
        "solo-variables-test-folder",
        JSON.stringify([{ key: "baseUrl", value: "https://api.example.com", enabled: false }])
      );

      const result = generateCurl({
        method: "GET",
        url: "{{baseUrl}}/users",
      });

      expect(result).toContain("{{baseUrl}}/users");
    });

    it("should handle missing current folder", () => {
      const result = generateCurl({
        method: "GET",
        url: "{{baseUrl}}/users",
      });

      expect(result).toContain("{{baseUrl}}/users");
    });

    it("should handle invalid JSON in localStorage", () => {
      // Suppress console.warn for this test since we're intentionally testing error handling
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      sessionStorage.setItem("current-request-folder", "test-folder");
      localStorage.setItem("solo-variables-test-folder", "invalid-json");

      const result = generateCurl({
        method: "GET",
        url: "{{baseUrl}}/users",
      });

      expect(result).toContain("{{baseUrl}}/users");
      expect(consoleWarnSpy).toHaveBeenCalledWith("Error processing variables:", expect.any(Error));

      consoleWarnSpy.mockRestore();
    });
  });

  describe("GraphQL requests", () => {
    it("should generate basic GraphQL request", () => {
      const result = generateCurl({
        method: "POST",
        url: "https://api.example.com/graphql",
        requestType: "graphql",
        graphqlQuery: "query { users { id name } }",
      });

      expect(result).toContain("curl -X POST");
      expect(result).toContain("https://api.example.com/graphql");
      expect(result).toContain('-H "Content-Type: application/json"');
      expect(result).toContain("query { users { id name } }");
    });

    it("should generate GraphQL request with variables", () => {
      const result = generateCurl({
        method: "POST",
        url: "https://api.example.com/graphql",
        requestType: "graphql",
        graphqlQuery: "query($id: ID!) { user(id: $id) { name } }",
        graphqlVariables: '{"id":"123"}',
      });

      expect(result).toContain("query($id: ID!)");
      expect(result).toContain('\\"id\\":\\"123\\"');
    });

    it("should handle invalid GraphQL variables JSON", () => {
      const result = generateCurl({
        method: "POST",
        url: "https://api.example.com/graphql",
        requestType: "graphql",
        graphqlQuery: "query { users { id } }",
        graphqlVariables: "invalid-json",
      });

      expect(result).toContain("query { users { id } }");
      expect(result).toContain('\\"variables\\":{}');
    });

    it("should add Basic Auth to GraphQL request", () => {
      const result = generateCurl({
        method: "POST",
        url: "https://api.example.com/graphql",
        requestType: "graphql",
        graphqlQuery: "query { users { id } }",
        useBasicAuth: true,
        username: "admin",
        password: "secret",
      });

      expect(result).toContain('-u "admin:secret"');
    });

    it("should add Bearer token to GraphQL request", () => {
      const result = generateCurl({
        method: "POST",
        url: "https://api.example.com/graphql",
        requestType: "graphql",
        graphqlQuery: "query { users { id } }",
        bearerToken: "token123",
      });

      expect(result).toContain('-H "Authorization: Bearer token123"');
    });

    it("should replace variables in GraphQL URL", () => {
      sessionStorage.setItem("current-request-folder", "test-folder");
      localStorage.setItem(
        "solo-variables-test-folder",
        JSON.stringify([
          { key: "graphqlUrl", value: "https://api.example.com/graphql", enabled: true },
        ])
      );

      const result = generateCurl({
        method: "POST",
        url: "{{graphqlUrl}}",
        requestType: "graphql",
        graphqlQuery: "query { users { id } }",
      });

      expect(result).toContain("https://api.example.com/graphql");
    });
  });

  describe("Complex scenarios", () => {
    it("should handle complete HTTP request with all options", () => {
      sessionStorage.setItem("current-request-folder", "test-folder");
      localStorage.setItem(
        "solo-variables-test-folder",
        JSON.stringify([{ key: "baseUrl", value: "https://api.example.com", enabled: true }])
      );

      const result = generateCurl({
        method: "POST",
        url: "{{baseUrl}}/users",
        payload: '{"name":"John","email":"john@example.com"}',
        useBasicAuth: true,
        username: "admin",
        password: "secret",
        bearerToken: "token123",
        queryParams: [
          { key: "source", value: "web", enabled: true },
          { key: "version", value: "v2", enabled: true },
        ],
      });

      expect(result).toContain("https://api.example.com/users?source=web&version=v2");
      expect(result).toContain('-u "admin:secret"');
      expect(result).toContain('-H "Authorization: Bearer token123"');
      expect(result).toContain('-H "Content-Type: application/json"');
      expect(result).toContain("john@example.com");
    });
  });
});

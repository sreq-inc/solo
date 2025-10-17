import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { FileProvider } from "../context/FileContext";
import { RequestProvider } from "../context/RequestContext";
import { ThemeProvider } from "../context/ThemeContext";
import { VariablesProvider } from "../context/VariablesContext";

// Create a custom render function that includes all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <FileProvider>
        <VariablesProvider>
          <RequestProvider>{children}</RequestProvider>
        </VariablesProvider>
      </FileProvider>
    </ThemeProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from @testing-library/react
export * from "@testing-library/react";

// Override render method
export { customRender as render };

// Helper function to create mock stored files
export const createMockStoredFile = (overrides = {}) => ({
  id: "test-id",
  name: "Test Request",
  method: "GET",
  url: "https://api.example.com/test",
  payload: "",
  authType: "none",
  basicAuth: { username: "", password: "" },
  bearerToken: "",
  queryParams: [],
  requestType: "HTTP",
  ...overrides,
});

// Helper function to create mock variables
export const createMockVariable = (overrides = {}) => ({
  id: "var-id",
  key: "testVar",
  value: "testValue",
  ...overrides,
});

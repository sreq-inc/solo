import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../context/ThemeContext";
import { VariablesProvider } from "../context/VariablesContext";
import { SmartUrlInput } from "./SmartUrlInput";

const renderSmartUrlInput = (
  props: Parameters<typeof SmartUrlInput>[0],
  theme: "light" | "dark" = "light",
  variables: any[] = []
) => {
  localStorage.setItem("theme", theme);

  if (variables.length > 0) {
    localStorage.setItem("solo-variables-test", JSON.stringify(variables));
    sessionStorage.setItem("current-request-folder", "test");
  }

  return render(
    <ThemeProvider>
      <VariablesProvider>
        <SmartUrlInput {...props} />
      </VariablesProvider>
    </ThemeProvider>
  );
};

describe("SmartUrlInput", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("Rendering", () => {
    it("should render input field", () => {
      const onChange = vi.fn();
      renderSmartUrlInput({ value: "", onChange });

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("should render with placeholder", () => {
      const onChange = vi.fn();
      renderSmartUrlInput({
        value: "",
        onChange,
        placeholder: "Enter URL here",
      });

      const input = screen.getByPlaceholderText("Enter URL here");
      expect(input).toBeInTheDocument();
    });

    it("should render with initial value", () => {
      const onChange = vi.fn();
      renderSmartUrlInput({
        value: "https://api.example.com",
        onChange,
      });

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("https://api.example.com");
    });
  });

  describe("Basic Interactions", () => {
    it("should call onChange when typing", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSmartUrlInput({ value: "", onChange });

      const input = screen.getByRole("textbox");
      await user.type(input, "test");

      expect(onChange).toHaveBeenCalled();
    });

    it("should update value when typing", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSmartUrlInput({ value: "", onChange });

      const input = screen.getByRole("textbox");
      await user.type(input, "api");

      // Check that onChange was called at least 3 times (once per character)
      expect(onChange).toHaveBeenCalled();
      expect(onChange.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it("should apply custom className", () => {
      const onChange = vi.fn();
      renderSmartUrlInput({
        value: "",
        onChange,
        className: "custom-input-class",
      });

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom-input-class");
    });
  });

  describe("Variable Detection", () => {
    it("should detect variable syntax", async () => {
      const onChange = vi.fn();
      const { container } = renderSmartUrlInput({ value: "{{baseUrl}}/api", onChange }, "light", [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
      ]);

      const input = screen.getByRole("textbox");
      await userEvent.click(input);

      await waitFor(() => {
        const indicators = container.querySelectorAll(".w-2.h-2.rounded-full");
        expect(indicators.length).toBeGreaterThan(0);
      });
    });

    it("should show red indicator for undefined variable", async () => {
      const onChange = vi.fn();
      const { container } = renderSmartUrlInput(
        { value: "{{undefinedVar}}/api", onChange },
        "light",
        []
      );

      const input = screen.getByRole("textbox");
      await userEvent.click(input);

      await waitFor(() => {
        const redIndicator = container.querySelector(".bg-red-500");
        expect(redIndicator).toBeInTheDocument();
      });
    });

    it("should show green indicator for defined variable", async () => {
      const onChange = vi.fn();
      const { container } = renderSmartUrlInput({ value: "{{baseUrl}}/api", onChange }, "light", [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
      ]);

      const input = screen.getByRole("textbox");
      await userEvent.click(input);

      await waitFor(() => {
        const greenIndicator = container.querySelector(".bg-green-500");
        expect(greenIndicator).toBeInTheDocument();
      });
    });

    it("should detect multiple variables", async () => {
      const onChange = vi.fn();
      const { container } = renderSmartUrlInput(
        { value: "{{baseUrl}}/{{endpoint}}", onChange },
        "light",
        [
          { key: "baseUrl", value: "https://api.example.com", enabled: true },
          { key: "endpoint", value: "users", enabled: true },
        ]
      );

      const input = screen.getByRole("textbox");
      await userEvent.click(input);

      await waitFor(() => {
        // The component shows indicators both in the input area and in the preview panel
        const indicators = container.querySelectorAll(".w-2.h-2.rounded-full");
        expect(indicators.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe("Variable Preview", () => {
    it("should show preview on focus", async () => {
      const onChange = vi.fn();
      renderSmartUrlInput({ value: "{{baseUrl}}/api", onChange }, "light", [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
      ]);

      const input = screen.getByRole("textbox");
      await userEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText("Variables found:")).toBeInTheDocument();
      });
    });

    it("should hide preview on blur", async () => {
      const onChange = vi.fn();
      renderSmartUrlInput({ value: "{{baseUrl}}/api", onChange }, "light", [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
      ]);

      const input = screen.getByRole("textbox");
      await userEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText("Variables found:")).toBeInTheDocument();
      });

      input.blur();

      await waitFor(
        () => {
          expect(screen.queryByText("Variables found:")).not.toBeInTheDocument();
        },
        { timeout: 300 }
      );
    });

    it("should show final URL in preview", async () => {
      const onChange = vi.fn();
      renderSmartUrlInput({ value: "{{baseUrl}}/api", onChange }, "light", [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
      ]);

      const input = screen.getByRole("textbox");
      await userEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText("Final URL:")).toBeInTheDocument();
      });
    });

    it("should not show preview when no variables present", async () => {
      const onChange = vi.fn();
      renderSmartUrlInput({ value: "https://api.example.com", onChange });

      const input = screen.getByRole("textbox");
      await userEvent.click(input);

      expect(screen.queryByText("Variables found:")).not.toBeInTheDocument();
    });
  });

  describe("Bracket Auto-completion", () => {
    it("should handle bracket input", async () => {
      const onChange = vi.fn();
      renderSmartUrlInput({ value: "", onChange });

      const input = screen.getByRole("textbox") as HTMLInputElement;
      input.focus();

      // Simulate typing an opening brace which triggers auto-completion
      const event = new KeyboardEvent("keydown", { key: "{", bubbles: true });
      input.dispatchEvent(event);

      // The component intercepts '{' and auto-completes it
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Theme Support", () => {
    it("should apply light theme to preview", async () => {
      const onChange = vi.fn();
      const { container } = renderSmartUrlInput({ value: "{{baseUrl}}/api", onChange }, "light", [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
      ]);

      const input = screen.getByRole("textbox");
      await userEvent.click(input);

      await waitFor(() => {
        const preview = container.querySelector(".bg-white");
        expect(preview).toBeInTheDocument();
      });
    });

    it("should apply dark theme to preview", async () => {
      const onChange = vi.fn();
      const { container } = renderSmartUrlInput({ value: "{{baseUrl}}/api", onChange }, "dark", [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
      ]);

      const input = screen.getByRole("textbox");
      await userEvent.click(input);

      await waitFor(() => {
        const preview = container.querySelector(".bg-gray-800");
        expect(preview).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty value", () => {
      const onChange = vi.fn();
      renderSmartUrlInput({ value: "", onChange });

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("");
    });

    it("should handle disabled variables", async () => {
      const onChange = vi.fn();
      const { container } = renderSmartUrlInput({ value: "{{baseUrl}}/api", onChange }, "light", [
        { key: "baseUrl", value: "https://api.example.com", enabled: false },
      ]);

      const input = screen.getByRole("textbox");
      await userEvent.click(input);

      await waitFor(() => {
        const redIndicator = container.querySelector(".bg-red-500");
        expect(redIndicator).toBeInTheDocument();
      });
    });

    it("should handle variables with whitespace", async () => {
      const onChange = vi.fn();
      const { container } = renderSmartUrlInput({ value: "{{ baseUrl }}/api", onChange }, "light", [
        { key: "baseUrl", value: "https://api.example.com", enabled: true },
      ]);

      const input = screen.getByRole("textbox");
      await userEvent.click(input);

      await waitFor(() => {
        const greenIndicator = container.querySelector(".bg-green-500");
        expect(greenIndicator).toBeInTheDocument();
      });
    });
  });
});

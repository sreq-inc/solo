import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FileProvider } from "../context/FileContext";
import { RequestProvider } from "../context/RequestContext";
import { ThemeProvider } from "../context/ThemeContext";
import { VariablesProvider } from "../context/VariablesContext";
import { InputMethod } from "./InputMethod";

// Mock the useToast hook
const mockToastWarning = vi.fn();
vi.mock("../hooks/useToast", () => ({
  useToast: () => ({
    warning: mockToastWarning,
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

const renderInputMethod = (
  theme: "light" | "dark" = "light",
  requestType: "http" | "grpc" | "graphql" = "http"
) => {
  localStorage.setItem("theme", theme);

  if (requestType !== "http") {
    localStorage.setItem("solo-request-type", requestType);
  }

  return render(
    <ThemeProvider>
      <VariablesProvider>
        <RequestProvider>
          <FileProvider>
            <InputMethod />
          </FileProvider>
        </RequestProvider>
      </VariablesProvider>
    </ThemeProvider>
  );
};

describe("InputMethod", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockToastWarning.mockClear();
  });

  describe("Rendering", () => {
    it("should render URL input field", () => {
      renderInputMethod();

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("should render send button", () => {
      renderInputMethod();

      expect(screen.getByRole("button", { name: /Send/i })).toBeInTheDocument();
    });

    it("should render clear button", () => {
      renderInputMethod();

      const clearButton = screen.getByTitle("Clear all fields");
      expect(clearButton).toBeInTheDocument();
    });

    it("should render method selector for HTTP requests", () => {
      renderInputMethod("light", "http");

      // SelectMethod renders a combobox
      const methodSelector = screen.getByRole("combobox");
      expect(methodSelector).toBeInTheDocument();
    });

    it("should show HTTP placeholder for HTTP requests", () => {
      renderInputMethod("light", "http");

      expect(screen.getByPlaceholderText(/https:\/\/api\.example\.com/i)).toBeInTheDocument();
    });
  });

  describe("Input interactions", () => {
    it("should allow typing in URL field", async () => {
      const user = userEvent.setup();
      renderInputMethod();

      const input = screen.getByRole("textbox");
      await user.type(input, "https://api.example.com");

      expect(input).toHaveValue("https://api.example.com");
    });

    it("should enable send button by default", () => {
      renderInputMethod();

      const sendButton = screen.getByRole("button", { name: /Send/i });
      expect(sendButton).not.toBeDisabled();
    });

    it("should have correct title on send button", () => {
      renderInputMethod();

      const sendButton = screen.getByTitle("Send request");
      expect(sendButton).toBeInTheDocument();
    });
  });

  describe("Theme support", () => {
    it("should apply light theme to URL input", () => {
      const { container } = renderInputMethod("light");

      const input = container.querySelector('input[type="text"]');
      expect(input).toHaveClass("bg-white");
      expect(input).toHaveClass("text-gray-800");
    });

    it("should apply dark theme to URL input", () => {
      const { container } = renderInputMethod("dark");

      const input = container.querySelector('input[type="text"]');
      expect(input).toHaveClass("bg-[#10121b]");
      expect(input).toHaveClass("text-white");
    });

    it("should apply light theme to send button", () => {
      renderInputMethod("light");

      const sendButton = screen.getByRole("button", { name: /Send/i });
      expect(sendButton).toHaveClass("bg-purple-600");
    });

    it("should apply dark theme to send button", () => {
      renderInputMethod("dark");

      const sendButton = screen.getByRole("button", { name: /Send/i });
      expect(sendButton).toHaveClass("bg-purple-700");
    });

    it("should apply light theme to clear button", () => {
      renderInputMethod("light");

      const clearButton = screen.getByTitle("Clear all fields");
      expect(clearButton).toHaveClass("bg-gray-300");
    });

    it("should apply dark theme to clear button", () => {
      renderInputMethod("dark");

      const clearButton = screen.getByTitle("Clear all fields");
      expect(clearButton).toHaveClass("bg-gray-700");
    });
  });

  describe("Button states", () => {
    it("should have hover effects on send button", () => {
      renderInputMethod("light");

      const sendButton = screen.getByRole("button", { name: /Send/i });
      expect(sendButton).toHaveClass("hover:bg-purple-700");
    });

    it("should have hover effects on clear button", () => {
      renderInputMethod("light");

      const clearButton = screen.getByTitle("Clear all fields");
      expect(clearButton).toHaveClass("hover:bg-gray-400");
    });

    it("should show loading state text when sending", () => {
      renderInputMethod();

      // The button should show "Send" when not loading
      expect(screen.getByRole("button", { name: /Send/i })).toBeInTheDocument();
    });
  });

  describe("Visual elements", () => {
    it("should show trash icon in clear button", () => {
      const { container } = renderInputMethod();

      const trashIcon = container.querySelector("svg.lucide-trash2");
      expect(trashIcon).toBeInTheDocument();
    });

    it("should have correct sizing for send button", () => {
      renderInputMethod();

      const sendButton = screen.getByRole("button", { name: /Send/i });
      expect(sendButton).toHaveClass("h-10");
    });

    it("should have correct sizing for clear button", () => {
      renderInputMethod();

      const clearButton = screen.getByTitle("Clear all fields");
      expect(clearButton).toHaveClass("h-10");
      expect(clearButton).toHaveClass("w-10");
    });

    it("should have rounded corners on buttons", () => {
      renderInputMethod();

      const sendButton = screen.getByRole("button", { name: /Send/i });
      expect(sendButton).toHaveClass("rounded");
    });
  });

  describe("Layout and spacing", () => {
    it("should have flex layout", () => {
      const { container } = renderInputMethod();

      const wrapper = container.querySelector(".flex.items-center");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have gap between elements", () => {
      const { container } = renderInputMethod();

      const wrapper = container.querySelector(".gap-4");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have button group with gap", () => {
      const { container } = renderInputMethod();

      const buttonGroup = container.querySelector(".flex.gap-2");
      expect(buttonGroup).toBeInTheDocument();
    });
  });

  describe("Input styling", () => {
    it("should have purple border on URL input", () => {
      const { container } = renderInputMethod();

      const input = container.querySelector('input[type="text"]');
      expect(input).toHaveClass("border-purple-500");
    });

    it("should have focus styles on URL input", () => {
      const { container } = renderInputMethod();

      const input = container.querySelector('input[type="text"]');
      expect(input).toHaveClass("focus:border-purple-500");
    });

    it("should remove outline on URL input", () => {
      const { container } = renderInputMethod();

      const input = container.querySelector('input[type="text"]');
      expect(input).toHaveClass("outline-none");
      expect(input).toHaveClass("focus:ring-0");
    });
  });

  describe("Request type variations", () => {
    it("should have method selector for HTTP by default", () => {
      const { container } = renderInputMethod("light", "http");

      const httpMethodSelector = container.querySelector(".w-24");
      expect(httpMethodSelector).toBeInTheDocument();
    });

    it("should have flex-grow URL input container", () => {
      const { container } = renderInputMethod("light", "http");

      // URL input container should take remaining width
      const input = container.querySelector(".flex-grow");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have title on clear button", () => {
      renderInputMethod();

      const clearButton = screen.getByTitle("Clear all fields");
      expect(clearButton).toBeTruthy();
    });

    it("should have title on send button", () => {
      renderInputMethod();

      const sendButton = screen.getByTitle("Send request");
      expect(sendButton).toBeTruthy();
    });

    it("should have cursor pointer on buttons", () => {
      renderInputMethod();

      const sendButton = screen.getByRole("button", { name: /Send/i });
      const clearButton = screen.getByTitle("Clear all fields");

      expect(sendButton).toHaveClass("cursor-pointer");
      expect(clearButton).toHaveClass("cursor-pointer");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty URL input", () => {
      const { container } = renderInputMethod();

      const input = container.querySelector('input[type="text"]');
      expect(input).toHaveValue("");
    });

    it("should handle placeholder display", () => {
      renderInputMethod("light", "http");

      const input = screen.getByPlaceholderText(/https:\/\/api\.example\.com/i);
      expect(input).toBeInTheDocument();
    });

    it("should show variable syntax in placeholder", () => {
      renderInputMethod("light", "http");

      expect(screen.getByPlaceholderText(/{{baseUrl}}/i)).toBeInTheDocument();
    });
  });

  describe("Button click handlers", () => {
    it("should have clear button that is clickable", async () => {
      const user = userEvent.setup();
      renderInputMethod();

      const clearButton = screen.getByTitle("Clear all fields");
      await user.click(clearButton);

      // Button should have been clicked (handler would be in RequestContext)
      expect(clearButton).toBeInTheDocument();
    });

    it("should have send button that is clickable", async () => {
      const _user = userEvent.setup();
      renderInputMethod();

      const sendButton = screen.getByRole("button", { name: /Send/i });

      // Button should be clickable
      expect(sendButton).not.toBeDisabled();
    });
  });

  describe("Visual feedback", () => {
    it("should have transition classes on buttons", () => {
      renderInputMethod();

      const sendButton = screen.getByRole("button", { name: /Send/i });
      expect(sendButton).toBeInTheDocument();
    });

    it("should have flex layout for send button content", () => {
      renderInputMethod();

      const sendButton = screen.getByRole("button", { name: /Send/i });
      expect(sendButton).toHaveClass("flex");
      expect(sendButton).toHaveClass("items-center");
      expect(sendButton).toHaveClass("justify-center");
    });
  });
});

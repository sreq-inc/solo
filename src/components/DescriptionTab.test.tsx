import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileProvider } from "../context/FileContext";
import { RequestProvider } from "../context/RequestContext";
import { ThemeProvider } from "../context/ThemeContext";
import { VariablesProvider } from "../context/VariablesContext";
import { DescriptionTab } from "./DescriptionTab";

// Mock the useToast hook
vi.mock("../hooks/useToast", () => ({
  useToast: () => ({
    warning: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

const renderDescriptionTab = (theme: "light" | "dark" = "light") => {
  localStorage.setItem("theme", theme);

  return render(
    <ThemeProvider>
      <VariablesProvider>
        <RequestProvider>
          <FileProvider>
            <DescriptionTab />
          </FileProvider>
        </RequestProvider>
      </VariablesProvider>
    </ThemeProvider>
  );
};

describe("DescriptionTab", () => {
  describe("Rendering", () => {
    it("should render textarea field", () => {
      renderDescriptionTab();

      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeInTheDocument();
    });

    it("should render with label", () => {
      renderDescriptionTab();

      expect(screen.getByText("Request Description")).toBeInTheDocument();
    });

    it("should render with placeholder text", () => {
      renderDescriptionTab();

      const textarea = screen.getByPlaceholderText(/Describe what this request does/i);
      expect(textarea).toBeInTheDocument();
    });

    it("should render documentation tips section", () => {
      renderDescriptionTab();

      expect(screen.getByText(/Documentation Tips/i)).toBeInTheDocument();
    });

    it("should render example section", () => {
      renderDescriptionTab();

      expect(screen.getByText("Example:")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should allow typing in textarea", async () => {
      const user = userEvent.setup();
      renderDescriptionTab();

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "Test description");

      expect(textarea).toHaveValue("Test description");
    });

    it("should show character count when text is entered", async () => {
      const user = userEvent.setup();
      renderDescriptionTab();

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "Hello");

      expect(screen.getByText(/Character count: 5/i)).toBeInTheDocument();
    });

    it("should not show character count when empty", () => {
      renderDescriptionTab();

      expect(screen.queryByText(/Character count/i)).not.toBeInTheDocument();
    });

    it("should update character count when typing", async () => {
      const user = userEvent.setup();
      renderDescriptionTab();

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "Test");

      expect(screen.getByText(/Character count: 4/i)).toBeInTheDocument();

      await user.type(textarea, " more");

      expect(screen.getByText(/Character count: 9/i)).toBeInTheDocument();
    });
  });

  describe("Theme support", () => {
    it("should apply light theme styles to textarea", () => {
      const { container } = renderDescriptionTab("light");

      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("bg-white");
      expect(textarea).toHaveClass("text-gray-800");
    });

    it("should apply dark theme styles to textarea", () => {
      const { container } = renderDescriptionTab("dark");

      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("bg-[#10121b]");
      expect(textarea).toHaveClass("text-white");
    });

    it("should apply light theme styles to label", () => {
      renderDescriptionTab("light");

      const label = screen.getByText("Request Description");
      expect(label).toHaveClass("text-gray-700");
    });

    it("should apply dark theme styles to label", () => {
      renderDescriptionTab("dark");

      const label = screen.getByText("Request Description");
      expect(label).toHaveClass("text-gray-300");
    });

    it("should apply light theme to tips section", () => {
      const { container } = renderDescriptionTab("light");

      const tipsSection = container.querySelector(".bg-gray-50");
      expect(tipsSection).toBeInTheDocument();
    });

    it("should apply dark theme to tips section", () => {
      const { container } = renderDescriptionTab("dark");

      const tipsSection = container.querySelector(".bg-gray-800\\/30");
      expect(tipsSection).toBeInTheDocument();
    });
  });

  describe("Textarea properties", () => {
    it("should have 8 rows", () => {
      const { container } = renderDescriptionTab();

      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveAttribute("rows", "8");
    });

    it("should have resize-none class", () => {
      const { container } = renderDescriptionTab();

      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("resize-none");
    });

    it("should have focus styles", () => {
      const { container } = renderDescriptionTab();

      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("focus:ring-2");
      expect(textarea).toHaveClass("focus:ring-purple-500");
    });
  });

  describe("Documentation tips content", () => {
    it("should show list of what to document", () => {
      renderDescriptionTab();

      expect(screen.getByText(/Purpose and functionality/i)).toBeInTheDocument();
      expect(screen.getByText(/Expected response format/i)).toBeInTheDocument();
      expect(screen.getByText(/Required authentication/i)).toBeInTheDocument();
    });

    it("should show example documentation", () => {
      renderDescriptionTab();

      const exampleText = screen.getByText(/Fetches user profile data/i);
      expect(exampleText).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("should handle very long text", async () => {
      const user = userEvent.setup();
      renderDescriptionTab();

      const textarea = screen.getByRole("textbox");
      const longText = "a".repeat(1000);
      await user.type(textarea, longText);

      expect(screen.getByText(/Character count: 1000/i)).toBeInTheDocument();
    });

    it("should handle multiline text", async () => {
      const user = userEvent.setup();
      renderDescriptionTab();

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "Line 1{Enter}Line 2");

      expect(textarea).toHaveValue("Line 1\nLine 2");
    });

    it("should handle special characters", async () => {
      const user = userEvent.setup();
      renderDescriptionTab();

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, 'Test <>&"');

      expect(textarea).toHaveValue('Test <>&"');
    });
  });
});

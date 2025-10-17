import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "../context/ThemeContext";
import { VariablesProvider } from "../context/VariablesContext";
import { VariablesTab } from "./VariablesTab";

const renderVariablesTab = (theme: "light" | "dark" = "light", folderName: string = "") => {
  localStorage.setItem("theme", theme);

  if (folderName) {
    sessionStorage.setItem("current-request-folder", folderName);
    localStorage.setItem(
      `solo-variables-${folderName}`,
      JSON.stringify([{ key: "", value: "", enabled: true }])
    );
  }

  return render(
    <ThemeProvider>
      <VariablesProvider>
        <VariablesTab />
      </VariablesProvider>
    </ThemeProvider>
  );
};

describe("VariablesTab", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("Rendering", () => {
    it("should render environment variables label", () => {
      renderVariablesTab("light", "test-folder");

      expect(screen.getByText("Environment Variables")).toBeInTheDocument();
    });

    it("should show current folder name", () => {
      renderVariablesTab("light", "test-folder");

      expect(screen.getByText("test-folder")).toBeInTheDocument();
    });

    it("should show no collection message when no folder selected", () => {
      renderVariablesTab();

      expect(screen.getByText("No collection selected")).toBeInTheDocument();
    });

    it("should show usage example section when folder is selected", () => {
      renderVariablesTab("light", "test-folder");

      expect(screen.getByText("Usage Example")).toBeInTheDocument();
    });

    it("should render add variable button when folder selected", () => {
      renderVariablesTab("light", "test-folder");

      expect(screen.getByRole("button", { name: /Add Variable/i })).toBeInTheDocument();
    });
  });

  describe("No folder state", () => {
    it("should show folder icon when no collection", () => {
      const { container } = renderVariablesTab();

      const folderIcon = container.querySelector("svg");
      expect(folderIcon).toBeInTheDocument();
    });

    it("should show help text when no collection", () => {
      renderVariablesTab();

      expect(screen.getByText(/Create a collection and add a request/i)).toBeInTheDocument();
    });

    it("should not show variable inputs when no collection", () => {
      renderVariablesTab();

      const keyInputs = screen.queryAllByPlaceholderText(/Variable Name/i);
      expect(keyInputs).toHaveLength(0);
    });

    it("should apply light theme to no collection message", () => {
      const { container } = renderVariablesTab("light");

      const message = container.querySelector(".bg-white");
      expect(message).toBeInTheDocument();
    });

    it("should apply dark theme to no collection message", () => {
      const { container } = renderVariablesTab("dark");

      const message = container.querySelector(".bg-\\[\\#10121b\\]");
      expect(message).toBeInTheDocument();
    });
  });

  describe("Variable management", () => {
    it("should add new variable when clicking add button", async () => {
      const user = userEvent.setup();
      renderVariablesTab("light", "test-folder");

      const addButton = screen.getByRole("button", { name: /Add Variable/i });
      await user.click(addButton);

      const keyInputs = screen.getAllByPlaceholderText(/Variable Name/i);
      expect(keyInputs.length).toBeGreaterThan(1);
    });

    it("should remove variable when clicking remove button", async () => {
      const user = userEvent.setup();
      renderVariablesTab("light", "test-folder");

      const addButton = screen.getByRole("button", { name: /Add Variable/i });
      await user.click(addButton);

      const initialCount = screen.getAllByPlaceholderText(/Variable Name/i).length;

      const removeButtons = screen.getAllByRole("button", { name: /Remove Variable/i });
      await user.click(removeButtons[0]);

      const finalCount = screen.getAllByPlaceholderText(/Variable Name/i).length;
      expect(finalCount).toBeLessThan(initialCount);
    });

    it("should update variable key", async () => {
      const user = userEvent.setup();
      renderVariablesTab("light", "test-folder");

      const keyInput = screen.getByPlaceholderText(/Variable Name/i);
      await user.type(keyInput, "baseUrl");

      expect(keyInput).toHaveValue("baseUrl");
    });

    it("should update variable value", async () => {
      const user = userEvent.setup();
      renderVariablesTab("light", "test-folder");

      const valueInput = screen.getByPlaceholderText(/Value \(e\.g\.,/i);
      await user.type(valueInput, "https://api.example.com");

      expect(valueInput).toHaveValue("https://api.example.com");
    });

    it("should toggle variable enabled state", async () => {
      const user = userEvent.setup();
      renderVariablesTab("light", "test-folder");

      const checkbox = screen.getByRole("checkbox");
      const initialState = checkbox.checked;

      await user.click(checkbox);

      expect(checkbox.checked).toBe(!initialState);
    });
  });

  describe("Theme support", () => {
    it("should apply light theme to variable inputs", () => {
      const { container } = renderVariablesTab("light", "test-folder");

      const keyInput = container.querySelector('input[placeholder*="Variable Name"]');
      expect(keyInput).toHaveClass("bg-white");
      expect(keyInput).toHaveClass("text-gray-800");
    });

    it("should apply dark theme to variable inputs", () => {
      const { container } = renderVariablesTab("dark", "test-folder");

      const keyInput = container.querySelector('input[placeholder*="Variable Name"]');
      expect(keyInput).toHaveClass("bg-[#10121b]");
      expect(keyInput).toHaveClass("text-white");
    });

    it("should apply light theme to folder badge", () => {
      const { container } = renderVariablesTab("light", "test-folder");

      const badge = container.querySelector(".bg-purple-100");
      expect(badge).toBeInTheDocument();
    });

    it("should apply dark theme to folder badge", () => {
      const { container } = renderVariablesTab("dark", "test-folder");

      const badge = container.querySelector(".bg-purple-900");
      expect(badge).toBeInTheDocument();
    });

    it("should apply light theme to add button", () => {
      renderVariablesTab("light", "test-folder");

      const addButton = screen.getByRole("button", { name: /Add Variable/i });
      expect(addButton).toHaveClass("border-gray-300");
    });

    it("should apply dark theme to add button", () => {
      renderVariablesTab("dark", "test-folder");

      const addButton = screen.getByRole("button", { name: /Add Variable/i });
      expect(addButton).toHaveClass("border-gray-600");
    });
  });

  describe("Usage example section", () => {
    it("should show variable definition example", () => {
      renderVariablesTab("light", "test-folder");

      expect(screen.getByText(/Define variable:/i)).toBeInTheDocument();
      expect(screen.getByText(/baseUrl = https:\/\/api\.example\.com/i)).toBeInTheDocument();
    });

    it("should show usage in URL example", () => {
      renderVariablesTab("light", "test-folder");

      expect(screen.getByText(/Use in URL:/i)).toBeInTheDocument();
    });

    it("should show result example", () => {
      renderVariablesTab("light", "test-folder");

      expect(screen.getByText(/Result:/i)).toBeInTheDocument();
    });

    it("should show variable syntax with double braces", () => {
      renderVariablesTab("light", "test-folder");

      expect(screen.getByText(/{{baseUrl}}\/users/i)).toBeInTheDocument();
    });

    it("should show collection name in footer", () => {
      renderVariablesTab("light", "test-folder");

      expect(screen.getByText(/Variables are saved per collection:/i)).toBeInTheDocument();
    });
  });

  describe("Visual elements", () => {
    it("should show folder icon in badge", () => {
      const { container } = renderVariablesTab("light", "test-folder");

      const folderIcons = container.querySelectorAll("svg");
      expect(folderIcons.length).toBeGreaterThan(0);
    });

    it("should show trash icon for remove button", async () => {
      const user = userEvent.setup();
      renderVariablesTab("light", "test-folder");

      const addButton = screen.getByRole("button", { name: /Add Variable/i });
      await user.click(addButton);

      const removeButtons = screen.getAllByRole("button", { name: /Remove Variable/i });
      expect(removeButtons.length).toBeGreaterThan(0);
    });

    it("should have purple borders on inputs", () => {
      const { container } = renderVariablesTab("light", "test-folder");

      const keyInput = container.querySelector('input[placeholder*="Variable Name"]');
      expect(keyInput).toHaveClass("border-purple-500");
    });
  });

  describe("Placeholder text", () => {
    it("should show helpful placeholder for key input", () => {
      renderVariablesTab("light", "test-folder");

      expect(screen.getByPlaceholderText(/Variable Name \(e\.g\., baseUrl\)/i)).toBeInTheDocument();
    });

    it("should show helpful placeholder for value input", () => {
      renderVariablesTab("light", "test-folder");

      expect(
        screen.getByPlaceholderText(/Value \(e\.g\., https:\/\/api\.example\.com\)/i)
      ).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("should handle folder with special characters", () => {
      renderVariablesTab("light", "folder-with-dashes");

      expect(screen.getByText("folder-with-dashes")).toBeInTheDocument();
    });

    it("should handle empty variable key", async () => {
      const user = userEvent.setup();
      renderVariablesTab("light", "test-folder");

      const keyInput = screen.getByPlaceholderText(/Variable Name/i);
      await user.clear(keyInput);

      expect(keyInput).toHaveValue("");
    });

    it("should handle empty variable value", async () => {
      const user = userEvent.setup();
      renderVariablesTab("light", "test-folder");

      const valueInput = screen.getByPlaceholderText(/Value \(e\.g\.,/i);
      await user.clear(valueInput);

      expect(valueInput).toHaveValue("");
    });

    it("should handle URL values with special characters", async () => {
      const user = userEvent.setup();
      renderVariablesTab("light", "test-folder");

      const valueInput = screen.getByPlaceholderText(/Value \(e\.g\.,/i);
      await user.type(valueInput, "https://api.example.com?key=value&foo=bar");

      expect(valueInput).toHaveValue("https://api.example.com?key=value&foo=bar");
    });
  });

  describe("Accessibility", () => {
    it("should have remove button with aria-label", async () => {
      const user = userEvent.setup();
      renderVariablesTab("light", "test-folder");

      const addButton = screen.getByRole("button", { name: /Add Variable/i });
      await user.click(addButton);

      const removeButtons = screen.getAllByRole("button", { name: /Remove Variable/i });
      expect(removeButtons[0]).toHaveAttribute("aria-label", "Remove Variable");
    });

    it("should have title on remove button", async () => {
      const user = userEvent.setup();
      renderVariablesTab("light", "test-folder");

      const addButton = screen.getByRole("button", { name: /Add Variable/i });
      await user.click(addButton);

      const removeButtons = screen.getAllByRole("button", { name: /Remove Variable/i });
      expect(removeButtons[0]).toHaveAttribute("title", "Remove Variable");
    });
  });
});

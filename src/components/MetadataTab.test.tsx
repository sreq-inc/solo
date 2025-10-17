import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../context/ThemeContext";
import { MetadataTab } from "./MetadataTab";

const renderMetadataTab = (
  metadata: string = "{}",
  onMetadataChange = vi.fn(),
  theme: "light" | "dark" = "light"
) => {
  localStorage.setItem("theme", theme);

  return render(
    <ThemeProvider>
      <MetadataTab metadata={metadata} onMetadataChange={onMetadataChange} />
    </ThemeProvider>
  );
};

describe("MetadataTab", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Rendering", () => {
    it("should render header with title", () => {
      renderMetadataTab();

      expect(screen.getByText("Custom Metadata Headers")).toBeInTheDocument();
    });

    it("should render add header button", () => {
      renderMetadataTab();

      expect(screen.getByRole("button", { name: /Add Header/i })).toBeInTheDocument();
    });

    it("should render one empty entry by default", () => {
      renderMetadataTab();

      const keyInputs = screen.getAllByPlaceholderText("header-key");
      expect(keyInputs).toHaveLength(1);
    });

    it("should render tips section", () => {
      renderMetadataTab();

      expect(screen.getByText(/Tips:/i)).toBeInTheDocument();
    });

    it("should show checkboxes for enabling/disabling headers", () => {
      renderMetadataTab();

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  describe("Adding and removing entries", () => {
    it("should add new entry when clicking add button", async () => {
      const user = userEvent.setup();
      renderMetadataTab();

      const addButton = screen.getByRole("button", { name: /Add Header/i });
      await user.click(addButton);

      const keyInputs = screen.getAllByPlaceholderText("header-key");
      expect(keyInputs).toHaveLength(2);
    });

    it("should remove entry when clicking remove button", async () => {
      const user = userEvent.setup();
      renderMetadataTab();

      const addButton = screen.getByRole("button", { name: /Add Header/i });
      await user.click(addButton);

      let keyInputs = screen.getAllByPlaceholderText("header-key");
      expect(keyInputs).toHaveLength(2);

      const removeButtons = screen.getAllByRole("button", { name: /✕/i });
      await user.click(removeButtons[0]);

      keyInputs = screen.getAllByPlaceholderText("header-key");
      expect(keyInputs).toHaveLength(1);
    });

    it("should disable remove button when only one entry exists", () => {
      renderMetadataTab();

      const removeButton = screen.getByRole("button", { name: /✕/i });
      expect(removeButton).toBeDisabled();
    });

    it("should enable remove button when multiple entries exist", async () => {
      const user = userEvent.setup();
      renderMetadataTab();

      const addButton = screen.getByRole("button", { name: /Add Header/i });
      await user.click(addButton);

      const removeButtons = screen.getAllByRole("button", { name: /✕/i });
      removeButtons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe("Input interactions", () => {
    it("should update key input", async () => {
      const user = userEvent.setup();
      const onMetadataChange = vi.fn();
      renderMetadataTab("{}", onMetadataChange);

      const keyInput = screen.getByPlaceholderText("header-key");
      await user.type(keyInput, "x-api-key");

      expect(keyInput).toHaveValue("x-api-key");
    });

    it("should update value input", async () => {
      const user = userEvent.setup();
      const onMetadataChange = vi.fn();
      renderMetadataTab("{}", onMetadataChange);

      const valueInput = screen.getByPlaceholderText("header-value");
      await user.type(valueInput, "test-value");

      expect(valueInput).toHaveValue("test-value");
    });

    it("should convert keys to lowercase automatically", async () => {
      const user = userEvent.setup();
      const onMetadataChange = vi.fn();
      renderMetadataTab("{}", onMetadataChange);

      const keyInput = screen.getByPlaceholderText("header-key");
      await user.type(keyInput, "X-API-KEY");

      expect(keyInput).toHaveValue("x-api-key");
    });

    it("should toggle checkbox", async () => {
      const user = userEvent.setup();
      renderMetadataTab();

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe("Validation", () => {
    it("should automatically convert keys to lowercase", async () => {
      const user = userEvent.setup();
      const onMetadataChange = vi.fn();
      renderMetadataTab("{}", onMetadataChange);

      const keyInput = screen.getByPlaceholderText("header-key");

      // The component auto-lowercases input
      await user.type(keyInput, "test");

      // The value should be lowercase
      expect(keyInput).toHaveValue("test");
    });

    it("should not include disabled entries in metadata", async () => {
      const user = userEvent.setup();
      const onMetadataChange = vi.fn();
      renderMetadataTab("{}", onMetadataChange);

      const keyInput = screen.getByPlaceholderText("header-key");
      const valueInput = screen.getByPlaceholderText("header-value");

      await user.type(keyInput, "x-test");
      await user.type(valueInput, "test-value");

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      // Should call onMetadataChange with empty object since entry is disabled
      expect(onMetadataChange).toHaveBeenCalledWith("{}");
    });
  });

  describe("Loading metadata", () => {
    it("should parse and display existing metadata", () => {
      const metadata = JSON.stringify({
        "x-api-key": "test-key",
        "x-request-id": "123",
      });

      renderMetadataTab(metadata);

      const keyInputs = screen.getAllByPlaceholderText("header-key");
      expect(keyInputs).toHaveLength(3); // 2 existing + 1 empty
    });

    it("should handle empty metadata string", () => {
      renderMetadataTab("");

      const keyInputs = screen.getAllByPlaceholderText("header-key");
      expect(keyInputs).toHaveLength(1);
    });

    it("should handle empty JSON object", () => {
      renderMetadataTab("{}");

      const keyInputs = screen.getAllByPlaceholderText("header-key");
      expect(keyInputs).toHaveLength(1);
    });
  });

  describe("Theme support", () => {
    it("should apply light theme to inputs", () => {
      const { container } = renderMetadataTab("{}", vi.fn(), "light");

      const keyInput = container.querySelector('input[placeholder="header-key"]');
      expect(keyInput).toHaveClass("bg-white");
      expect(keyInput).toHaveClass("text-gray-800");
    });

    it("should apply dark theme to inputs", () => {
      const { container } = renderMetadataTab("{}", vi.fn(), "dark");

      const keyInput = container.querySelector('input[placeholder="header-key"]');
      expect(keyInput).toHaveClass("bg-gray-700");
      expect(keyInput).toHaveClass("text-white");
    });

    it("should apply light theme to add button", () => {
      renderMetadataTab("{}", vi.fn(), "light");

      const addButton = screen.getByRole("button", { name: /Add Header/i });
      expect(addButton).toHaveClass("bg-purple-600");
    });

    it("should apply dark theme to add button", () => {
      renderMetadataTab("{}", vi.fn(), "dark");

      const addButton = screen.getByRole("button", { name: /Add Header/i });
      expect(addButton).toHaveClass("bg-purple-700");
    });
  });

  describe("Tips section content", () => {
    it("should show tips about lowercase keys", () => {
      renderMetadataTab();

      expect(screen.getByText(/Header keys must be lowercase/i)).toBeInTheDocument();
    });

    it("should show tips about checkboxes", () => {
      renderMetadataTab();

      expect(screen.getByText(/Use checkboxes to temporarily disable/i)).toBeInTheDocument();
    });

    it("should show common header examples", () => {
      renderMetadataTab();

      expect(screen.getByText(/x-request-id, x-trace-id/i)).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("should handle invalid JSON gracefully", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      renderMetadataTab("invalid-json");

      const keyInputs = screen.getAllByPlaceholderText("header-key");
      expect(keyInputs).toHaveLength(1);

      consoleError.mockRestore();
    });

    it("should handle special characters in values", async () => {
      const user = userEvent.setup();
      renderMetadataTab();

      const valueInput = screen.getByPlaceholderText("header-value");
      await user.type(valueInput, "value-with-special!@#$%");

      expect(valueInput).toHaveValue("value-with-special!@#$%");
    });
  });

  describe("Callback functionality", () => {
    it("should call onMetadataChange when adding entry", async () => {
      const user = userEvent.setup();
      const onMetadataChange = vi.fn();
      renderMetadataTab("{}", onMetadataChange);

      const keyInput = screen.getByPlaceholderText("header-key");
      const valueInput = screen.getByPlaceholderText("header-value");

      await user.type(keyInput, "x-test");
      await user.type(valueInput, "value");

      expect(onMetadataChange).toHaveBeenCalled();
    });

    it("should generate correct JSON output", async () => {
      const user = userEvent.setup();
      const onMetadataChange = vi.fn();
      renderMetadataTab("{}", onMetadataChange);

      const keyInput = screen.getByPlaceholderText("header-key");
      const valueInput = screen.getByPlaceholderText("header-value");

      await user.type(keyInput, "x-api-key");
      await user.type(valueInput, "test-value");

      const calls = onMetadataChange.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      const parsed = JSON.parse(lastCall);

      expect(parsed["x-api-key"]).toBe("test-value");
    });
  });
});

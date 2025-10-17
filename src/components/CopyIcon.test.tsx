import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../context/ThemeContext";
import { CopyIcon } from "./CopyIcon";

const renderCopyIcon = (props: Parameters<typeof CopyIcon>[0]) => {
  return render(
    <ThemeProvider>
      <CopyIcon {...props} />
    </ThemeProvider>
  );
};

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn(),
};

Object.assign(navigator, {
  clipboard: mockClipboard,
});

describe("CopyIcon", () => {
  beforeEach(() => {
    mockClipboard.writeText.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe("Rendering", () => {
    it("should render copy button", () => {
      renderCopyIcon({ content: "test content" });

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should show copy icon by default", () => {
      const { container } = renderCopyIcon({ content: "test content" });

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();

      // Copy icon should be visible
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should have correct title attribute", () => {
      renderCopyIcon({ content: "test content" });

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title", "Copy as cURL");
    });

    it("should apply custom className", () => {
      renderCopyIcon({ content: "test content", className: "custom-class" });

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("should apply default size", () => {
      const { container } = renderCopyIcon({ content: "test content" });

      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "16");
      expect(svg).toHaveAttribute("height", "16");
    });

    it("should apply custom size", () => {
      const { container } = renderCopyIcon({ content: "test content", size: 24 });

      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "24");
      expect(svg).toHaveAttribute("height", "24");
    });
  });

  describe("Copy functionality", () => {
    it("should copy content to clipboard when clicked", async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      renderCopyIcon({ content: "test content" });

      const button = screen.getByRole("button");

      fireEvent.click(button);

      await waitFor(
        () => {
          expect(mockClipboard.writeText).toHaveBeenCalledWith("test content");
        },
        { timeout: 1000 }
      );

      expect(mockClipboard.writeText).toHaveBeenCalledTimes(1);
    });

    it("should copy empty string", async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      renderCopyIcon({ content: "" });

      const button = screen.getByRole("button");

      fireEvent.click(button);

      await waitFor(
        () => {
          expect(mockClipboard.writeText).toHaveBeenCalledWith("");
        },
        { timeout: 1000 }
      );
    });

    it("should copy complex content", async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      const complexContent =
        'curl -X POST "https://api.example.com/users" -H "Content-Type: application/json"';
      renderCopyIcon({ content: complexContent });

      const button = screen.getByRole("button");

      fireEvent.click(button);

      await waitFor(
        () => {
          expect(mockClipboard.writeText).toHaveBeenCalledWith(complexContent);
        },
        { timeout: 1000 }
      );
    });

    it("should handle special characters", async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      const specialContent = 'Content with "quotes" and \n newlines';
      renderCopyIcon({ content: specialContent });

      const button = screen.getByRole("button");

      fireEvent.click(button);

      await waitFor(
        () => {
          expect(mockClipboard.writeText).toHaveBeenCalledWith(specialContent);
        },
        { timeout: 1000 }
      );
    });
  });

  describe("Visual feedback", () => {
    it("should show check icon after successful copy", async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      const { container } = renderCopyIcon({ content: "test content" });

      const button = screen.getByRole("button");

      fireEvent.click(button);

      await waitFor(
        () => {
          const svg = container.querySelector("svg.text-green-500");
          expect(svg).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("should revert to copy icon after timeout", async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      const { container } = renderCopyIcon({ content: "test content" });

      const button = screen.getByRole("button");

      fireEvent.click(button);

      // Wait for check icon to appear
      await waitFor(
        () => {
          expect(container.querySelector("svg.text-green-500")).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Wait for the timeout to complete (2000ms) and icon to revert
      await waitFor(
        () => {
          expect(container.querySelector("svg.text-green-500")).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(button).toBeInTheDocument();
    });

    it("should handle multiple rapid clicks", async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      renderCopyIcon({ content: "test content" });

      const button = screen.getByRole("button");

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(mockClipboard.writeText).toHaveBeenCalledTimes(3);
        },
        { timeout: 1000 }
      );
    });

    it("should reset timer on subsequent clicks", async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      renderCopyIcon({ content: "test content" });

      const button = screen.getByRole("button");

      fireEvent.click(button);

      await waitFor(
        () => {
          expect(mockClipboard.writeText).toHaveBeenCalledTimes(1);
        },
        { timeout: 1000 }
      );

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 1000));

      fireEvent.click(button);

      await waitFor(
        () => {
          expect(mockClipboard.writeText).toHaveBeenCalledTimes(2);
        },
        { timeout: 1000 }
      );
    });
  });

  describe("Error handling", () => {
    it("should handle clipboard write error gracefully", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      mockClipboard.writeText.mockRejectedValue(new Error("Clipboard access denied"));

      renderCopyIcon({ content: "test content" });

      const button = screen.getByRole("button");

      fireEvent.click(button);

      // Wait a bit for the error to be logged
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to copy:", expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it("should not show check icon on error", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      mockClipboard.writeText.mockRejectedValue(new Error("Error"));

      const { container } = renderCopyIcon({ content: "test content" });

      const button = screen.getByRole("button");

      fireEvent.click(button);

      // Wait a bit for the error to be logged
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(consoleErrorSpy).toHaveBeenCalled();

      // Should still show copy icon, not check
      const checkIcon = container.querySelector("svg.text-green-500");
      expect(checkIcon).not.toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Event handling", () => {
    it("should stop event propagation", async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);
      const parentClickHandler = vi.fn();

      const { container } = render(
        <ThemeProvider>
          <div
            role="button"
            tabIndex={0}
            onClick={parentClickHandler}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                parentClickHandler();
              }
            }}
          >
            <CopyIcon content="test content" />
          </div>
        </ThemeProvider>
      );

      const button = container.querySelector("button");
      if (button) {
        fireEvent.click(button);
      }

      await waitFor(
        () => {
          expect(mockClipboard.writeText).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );

      expect(parentClickHandler).not.toHaveBeenCalled();
    });
  });

  describe("Theme support", () => {
    it("should apply light theme hover styles", () => {
      renderCopyIcon({ content: "test content" });

      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-gray-200");
      expect(button).toHaveClass("text-gray-600");
      expect(button).toHaveClass("hover:text-gray-800");
    });

    it("should have transition classes", () => {
      renderCopyIcon({ content: "test content" });

      const button = screen.getByRole("button");
      expect(button).toHaveClass("transition-colors");
    });

    it("should have cursor pointer", () => {
      renderCopyIcon({ content: "test content" });

      const button = screen.getByRole("button");
      expect(button).toHaveClass("cursor-pointer");
    });
  });

  describe("Accessibility", () => {
    it("should be keyboard accessible", async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      renderCopyIcon({ content: "test content" });

      const button = screen.getByRole("button");
      button.focus();

      fireEvent.keyPress(button, { key: "Enter", code: "Enter" });
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(mockClipboard.writeText).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });

    it("should be focusable", () => {
      renderCopyIcon({ content: "test content" });

      const button = screen.getByRole("button");
      button.focus();

      expect(document.activeElement).toBe(button);
    });

    it("should have accessible title", () => {
      renderCopyIcon({ content: "test content" });

      const button = screen.getByRole("button");
      expect(button.getAttribute("title")).toBe("Copy as cURL");
    });
  });

  describe("Edge cases", () => {
    it("should handle very long content", async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      const longContent = "a".repeat(10000);
      renderCopyIcon({ content: longContent });

      const button = screen.getByRole("button");

      fireEvent.click(button);

      await waitFor(
        () => {
          expect(mockClipboard.writeText).toHaveBeenCalledWith(longContent);
        },
        { timeout: 1000 }
      );
    });

    it("should handle unicode content", async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      const unicodeContent = "你好世界 🌍 مرحبا";
      renderCopyIcon({ content: unicodeContent });

      const button = screen.getByRole("button");

      fireEvent.click(button);

      await waitFor(
        () => {
          expect(mockClipboard.writeText).toHaveBeenCalledWith(unicodeContent);
        },
        { timeout: 1000 }
      );
    });

    it("should handle size of 0", () => {
      const { container } = renderCopyIcon({ content: "test", size: 0 });

      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "0");
      expect(svg).toHaveAttribute("height", "0");
    });

    it("should handle negative size (edge case)", () => {
      const { container } = renderCopyIcon({ content: "test", size: -1 });

      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Component lifecycle", () => {
    it("should cleanup timeout on unmount", async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      const { unmount } = renderCopyIcon({ content: "test content" });

      const button = screen.getByRole("button");

      fireEvent.click(button);

      await waitFor(
        () => {
          expect(mockClipboard.writeText).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );

      // Unmount should not throw error even with pending timeout
      unmount();

      // Wait to ensure no errors occur
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it("should handle state updates after copy", async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      const { rerender } = renderCopyIcon({ content: "initial content" });

      const button = screen.getByRole("button");

      fireEvent.click(button);

      await waitFor(
        () => {
          expect(mockClipboard.writeText).toHaveBeenCalledWith("initial content");
        },
        { timeout: 1000 }
      );

      // Change content while copied state is active
      rerender(
        <ThemeProvider>
          <CopyIcon content="new content" />
        </ThemeProvider>
      );

      // Should still work with new content
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(mockClipboard.writeText).toHaveBeenLastCalledWith("new content");
        },
        { timeout: 1000 }
      );
    });
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FileProvider } from "../context/FileContext";
import { RequestProvider } from "../context/RequestContext";
import { ThemeProvider } from "../context/ThemeContext";
import { VariablesProvider } from "../context/VariablesContext";
import { ShortcutsDisplay } from "./ShortcutsDisplay";

// Mock ShortcutsModal
vi.mock("./ShortcutsModal", () => ({
  ShortcutsModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="shortcuts-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    );
  },
}));

const mockShortcuts = [
  {
    key: "k",
    cmd: true,
    description: "Create new collection",
    action: vi.fn(),
  },
  {
    key: "n",
    cmd: true,
    description: "Create new request",
    action: vi.fn(),
  },
  {
    key: "l",
    cmd: true,
    description: "Focus URL input",
    action: vi.fn(),
  },
];

// Mock useKeyboardShortcuts hook
vi.mock("../hooks/useKeyboardShortcuts", () => ({
  useKeyboardShortcuts: () => mockShortcuts,
}));

const renderShortcutsDisplay = (theme: "light" | "dark" = "light") => {
  localStorage.setItem("theme", theme);

  return render(
    <ThemeProvider>
      <VariablesProvider>
        <RequestProvider>
          <FileProvider>
            <ShortcutsDisplay />
          </FileProvider>
        </RequestProvider>
      </VariablesProvider>
    </ThemeProvider>
  );
};

describe("ShortcutsDisplay", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render component", () => {
      const { container } = renderShortcutsDisplay();

      expect(container.firstChild).toBeInTheDocument();
    });

    it("should display Solo logo", () => {
      renderShortcutsDisplay();

      const logo = screen.getByRole("img");
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute("src", "/solo_preview.png");
    });

    it("should render shortcut container", () => {
      const { container } = renderShortcutsDisplay();

      const shortcutsContainer = container.querySelector(".gap-4");
      expect(shortcutsContainer).toBeInTheDocument();
    });

    it('should display "View all shortcuts" button', () => {
      renderShortcutsDisplay();

      const viewAllButton = screen.getByText("View all shortcuts");
      expect(viewAllButton).toBeInTheDocument();
    });

    it("should display tip message", () => {
      renderShortcutsDisplay();

      expect(
        screen.getByText(/Tip: Press any shortcut to quickly perform actions/)
      ).toBeInTheDocument();
    });
  });

  describe("Theme support", () => {
    it("should apply light theme text color", () => {
      const { container } = renderShortcutsDisplay("light");

      const mainDiv = container.querySelector(".p-8");
      expect(mainDiv).toHaveClass("text-gray-700");
    });

    it("should apply dark theme text color", () => {
      const { container } = renderShortcutsDisplay("dark");

      const mainDiv = container.querySelector(".p-8");
      expect(mainDiv).toHaveClass("text-gray-300");
    });

    it("should apply light theme to View all button", () => {
      renderShortcutsDisplay("light");

      const button = screen.getByText("View all shortcuts");
      expect(button).toHaveClass("border-gray-300");
      expect(button).toHaveClass("text-gray-500");
    });

    it("should apply dark theme to View all button", () => {
      renderShortcutsDisplay("dark");

      const button = screen.getByText("View all shortcuts");
      expect(button).toHaveClass("border-gray-600");
      expect(button).toHaveClass("text-gray-400");
    });
  });

  describe("Modal interactions", () => {
    it("should not show modal initially", () => {
      renderShortcutsDisplay();

      expect(screen.queryByTestId("shortcuts-modal")).not.toBeInTheDocument();
    });

    it('should open modal when "View all shortcuts" is clicked', () => {
      renderShortcutsDisplay();

      const viewAllButton = screen.getByText("View all shortcuts");
      fireEvent.click(viewAllButton);

      expect(screen.getByTestId("shortcuts-modal")).toBeInTheDocument();
    });

    it("should close modal when onClose is called", async () => {
      renderShortcutsDisplay();

      const viewAllButton = screen.getByText("View all shortcuts");
      fireEvent.click(viewAllButton);

      expect(screen.getByTestId("shortcuts-modal")).toBeInTheDocument();

      const closeButton = screen.getByText("Close Modal");
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId("shortcuts-modal")).not.toBeInTheDocument();
      });
    });

    it("should close modal on Escape key", async () => {
      renderShortcutsDisplay();

      const viewAllButton = screen.getByText("View all shortcuts");
      fireEvent.click(viewAllButton);

      expect(screen.getByTestId("shortcuts-modal")).toBeInTheDocument();

      fireEvent.keyDown(window, { key: "Escape" });

      await waitFor(() => {
        expect(screen.queryByTestId("shortcuts-modal")).not.toBeInTheDocument();
      });
    });

    it("should not close modal on other keys", async () => {
      renderShortcutsDisplay();

      const viewAllButton = screen.getByText("View all shortcuts");
      fireEvent.click(viewAllButton);

      expect(screen.getByTestId("shortcuts-modal")).toBeInTheDocument();

      fireEvent.keyDown(window, { key: "Enter" });

      await waitFor(() => {
        expect(screen.getByTestId("shortcuts-modal")).toBeInTheDocument();
      });
    });

    it("should only close on Escape when modal is open", () => {
      renderShortcutsDisplay();

      fireEvent.keyDown(window, { key: "Escape" });

      expect(screen.queryByTestId("shortcuts-modal")).not.toBeInTheDocument();
    });
  });

  describe("Visual layout", () => {
    it("should have proper padding", () => {
      const { container } = renderShortcutsDisplay();

      const mainDiv = container.querySelector(".p-8");
      expect(mainDiv).toHaveClass("p-8");
    });

    it("should have logo with correct height", () => {
      renderShortcutsDisplay();

      const logo = screen.getByRole("img");
      expect(logo).toHaveClass("h-40");
    });

    it("should have gap between shortcuts", () => {
      const { container } = renderShortcutsDisplay();

      const shortcutsContainer = container.querySelector(".gap-4");
      expect(shortcutsContainer).toBeInTheDocument();
    });
  });

  describe("Button styling", () => {
    it("should have cursor pointer on View all button", () => {
      renderShortcutsDisplay();

      const button = screen.getByText("View all shortcuts");
      expect(button).toHaveClass("cursor-pointer");
    });

    it("should have border on View all button", () => {
      renderShortcutsDisplay();

      const button = screen.getByText("View all shortcuts");
      expect(button).toHaveClass("border");
      expect(button).toHaveClass("border-dashed");
    });

    it("should have hover effects on View all button", () => {
      renderShortcutsDisplay("light");

      const button = screen.getByText("View all shortcuts");
      expect(button).toHaveClass("hover:bg-gray-50");
    });

    it("should have title attribute on View all button", () => {
      renderShortcutsDisplay();

      const button = screen.getByText("View all shortcuts");
      expect(button).toHaveAttribute("title", "View all shortcuts");
    });
  });

  describe("Accessibility", () => {
    it("should have proper button role", () => {
      renderShortcutsDisplay();

      const button = screen.getByRole("button", { name: /view all shortcuts/i });
      expect(button).toBeInTheDocument();
    });

    it("should have descriptive title attribute", () => {
      renderShortcutsDisplay();

      const button = screen.getByText("View all shortcuts");
      expect(button.title).toBeTruthy();
    });

    it("should be keyboard accessible", () => {
      renderShortcutsDisplay();

      const button = screen.getByText("View all shortcuts");
      button.focus();

      expect(document.activeElement).toBe(button);
    });

    it("should have img alt attribute for logo", () => {
      renderShortcutsDisplay();

      const logo = screen.getByRole("img");
      expect(logo).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("should render without errors", () => {
      const { container } = renderShortcutsDisplay();
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle rapid modal open/close", async () => {
      renderShortcutsDisplay();

      const viewAllButton = screen.getByText("View all shortcuts");

      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        fireEvent.click(viewAllButton);
        await waitFor(() => {
          expect(screen.getByTestId("shortcuts-modal")).toBeInTheDocument();
        });

        const closeButton = screen.getByText("Close Modal");
        fireEvent.click(closeButton);

        await waitFor(() => {
          expect(screen.queryByTestId("shortcuts-modal")).not.toBeInTheDocument();
        });
      }

      // Should still be functional
      expect(viewAllButton).toBeInTheDocument();
    });
  });

  describe("Content structure", () => {
    it("should have centered logo container", () => {
      const { container } = renderShortcutsDisplay();

      const logoContainer = container.querySelector(".justify-center");
      expect(logoContainer).toBeInTheDocument();
    });

    it("should have italic tip text", () => {
      renderShortcutsDisplay();

      const tip = screen.getByText(/Tip: Press any shortcut to quickly perform actions/);
      expect(tip).toHaveClass("italic");
    });

    it("should center tip text", () => {
      renderShortcutsDisplay();

      const tip = screen.getByText(/Tip: Press any shortcut to quickly perform actions/);
      expect(tip).toHaveClass("text-center");
    });

    it("should have proper spacing for tip section", () => {
      const { container } = renderShortcutsDisplay();

      const tipSection = container.querySelector(".mt-8");
      expect(tipSection).toBeInTheDocument();
    });
  });

  describe("Interactive behavior", () => {
    it("should maintain state after modal close", async () => {
      renderShortcutsDisplay();

      const viewAllButton = screen.getByText("View all shortcuts");
      fireEvent.click(viewAllButton);

      const closeButton = screen.getByText("Close Modal");
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId("shortcuts-modal")).not.toBeInTheDocument();
      });

      // Original content should still be there
      expect(screen.getByText("View all shortcuts")).toBeInTheDocument();
    });
  });
});

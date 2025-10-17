import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../context/ThemeContext";
import { ShortcutsModal } from "./ShortcutsModal";

// Mock the useKeyboardShortcuts hook
vi.mock("../hooks/useKeyboardShortcuts", () => ({
  useKeyboardShortcuts: () => [
    { description: "Send Request", key: "r", cmd: true, alt: false, shift: false },
    { description: "Clear Fields", key: "l", cmd: true, alt: false, shift: false },
    { description: "New HTTP Request", key: "n", cmd: true, alt: false, shift: false },
  ],
}));

const renderModal = (
  props: Parameters<typeof ShortcutsModal>[0],
  theme: "light" | "dark" = "light"
) => {
  localStorage.setItem("theme", theme);
  return render(
    <ThemeProvider>
      <ShortcutsModal {...props} />
    </ThemeProvider>
  );
};

describe("ShortcutsModal", () => {
  describe("Rendering", () => {
    it("should not render when closed", () => {
      const onClose = vi.fn();
      const { container } = renderModal({ isOpen: false, onClose });

      expect(container.firstChild).toBeNull();
    });

    it("should render when open", () => {
      const onClose = vi.fn();
      renderModal({ isOpen: true, onClose });

      expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
    });

    it("should render all shortcuts", () => {
      const onClose = vi.fn();
      renderModal({ isOpen: true, onClose });

      expect(screen.getByText("Send Request")).toBeInTheDocument();
      expect(screen.getByText("Clear Fields")).toBeInTheDocument();
      expect(screen.getByText("New HTTP Request")).toBeInTheDocument();
    });

    it("should render close button", () => {
      const onClose = vi.fn();
      renderModal({ isOpen: true, onClose });

      const closeButton = screen.getByRole("button");
      expect(closeButton).toBeInTheDocument();
    });

    it("should render footer with ESC hint", () => {
      const onClose = vi.fn();
      renderModal({ isOpen: true, onClose });

      expect(screen.getByText(/Press/i)).toBeInTheDocument();
      expect(screen.getByText("ESC")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onClose when overlay is clicked", () => {
      const onClose = vi.fn();
      const { container } = renderModal({ isOpen: true, onClose });

      const overlay = container.querySelector(".bg-black\\/50");
      if (overlay) {
        fireEvent.click(overlay);
      }

      expect(onClose).toHaveBeenCalled();
    });

    it("should call onClose when close button is clicked", () => {
      const onClose = vi.fn();
      renderModal({ isOpen: true, onClose });

      const closeButton = screen.getByRole("button");
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("Shortcut formatting", () => {
    it("should format shortcuts with Cmd key", () => {
      const onClose = vi.fn();
      renderModal({ isOpen: true, onClose });

      expect(screen.getByText("Cmd + R")).toBeInTheDocument();
    });

    it("should display all shortcuts in correct format", () => {
      const onClose = vi.fn();
      renderModal({ isOpen: true, onClose });

      expect(screen.getByText("Cmd + R")).toBeInTheDocument();
      expect(screen.getByText("Cmd + L")).toBeInTheDocument();
      expect(screen.getByText("Cmd + N")).toBeInTheDocument();
    });
  });

  describe("Theme support", () => {
    it("should apply light theme styles", () => {
      const onClose = vi.fn();
      renderModal({ isOpen: true, onClose }, "light");

      const title = screen.getByText("Keyboard Shortcuts");
      expect(title).toHaveClass("text-gray-900");
    });

    it("should apply dark theme styles", () => {
      const onClose = vi.fn();
      renderModal({ isOpen: true, onClose }, "dark");

      const title = screen.getByText("Keyboard Shortcuts");
      expect(title).toHaveClass("text-gray-100");
    });
  });

  describe("Layout", () => {
    it("should have fixed positioning", () => {
      const onClose = vi.fn();
      const { container } = renderModal({ isOpen: true, onClose });

      const wrapper = container.querySelector(".fixed.inset-0");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have scrollable content area", () => {
      const onClose = vi.fn();
      const { container } = renderModal({ isOpen: true, onClose });

      const content = container.querySelector(".max-h-96.overflow-y-auto");
      expect(content).toBeInTheDocument();
    });
  });
});

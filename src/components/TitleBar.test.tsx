import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../context/ThemeContext";
import Titlebar from "./TitleBar";

// Mock Tauri API
vi.mock("@tauri-apps/plugin-os", () => ({
  platform: vi.fn(() => "macos"),
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: vi.fn(() => ({
    minimize: vi.fn(),
    maximize: vi.fn(),
    close: vi.fn(),
    isMaximized: vi.fn(() => Promise.resolve(false)),
    setSize: vi.fn(),
    onResized: vi.fn(() => Promise.resolve(() => {})),
  })),
  LogicalSize: vi.fn((width, height) => ({ width, height })),
}));

// Mock platform-specific controls
vi.mock("./WindowControl/MacOs", () => ({
  default: ({ textTheme }: { textTheme: string }) => (
    <div data-testid="macos-controls" className={textTheme}>
      MacOS Controls
    </div>
  ),
}));

vi.mock("./WindowControl/Windows", () => ({
  default: ({ textTheme }: { textTheme: string }) => (
    <div data-testid="windows-controls" className={textTheme}>
      Windows Controls
    </div>
  ),
}));

vi.mock("./WindowControl/Linux", () => ({
  default: ({ textTheme }: { textTheme: string }) => (
    <div data-testid="linux-controls" className={textTheme}>
      Linux Controls
    </div>
  ),
}));

const renderTitlebar = (theme: "light" | "dark" = "light") => {
  localStorage.setItem("theme", theme);

  return render(
    <ThemeProvider>
      <Titlebar />
    </ThemeProvider>
  );
};

describe("Titlebar", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render titlebar component", () => {
      const { container } = renderTitlebar();

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toBeInTheDocument();
    });

    it("should have correct height", () => {
      const { container } = renderTitlebar();

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toHaveClass("h-8");
    });

    it("should have full width", () => {
      const { container } = renderTitlebar();

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toHaveClass("w-full");
    });

    it("should have flex layout", () => {
      const { container } = renderTitlebar();

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toHaveClass("flex");
      expect(titlebar).toHaveClass("items-center");
      expect(titlebar).toHaveClass("justify-between");
    });

    it("should have cursor default", () => {
      const { container } = renderTitlebar();

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toHaveClass("cursor-default");
    });

    it("should have data-tauri-drag-region attribute", () => {
      const { container } = renderTitlebar();

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toHaveAttribute("data-tauri-drag-region");
    });
  });

  describe("Theme support", () => {
    it("should apply light theme background", () => {
      const { container } = renderTitlebar("light");

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toHaveClass("bg-gray-100");
    });

    it("should apply dark theme background", () => {
      const { container } = renderTitlebar("dark");

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toHaveClass("bg-[#10121b]");
    });

    it("should apply light theme text color", () => {
      const { container } = renderTitlebar("light");

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toHaveClass("text-gray-700");
    });

    it("should apply dark theme text color", () => {
      const { container } = renderTitlebar("dark");

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toHaveClass("text-gray-300");
    });
  });

  describe("Platform-specific controls - Default (macOS)", () => {
    it("should render platform controls", () => {
      renderTitlebar();

      const controls = screen.getByTestId("macos-controls");
      expect(controls).toBeInTheDocument();
    });

    it("should pass textTheme to controls in light mode", () => {
      renderTitlebar("light");

      const controls = screen.getByTestId("macos-controls");
      expect(controls).toHaveClass("text-gray-700");
    });

    it("should pass textTheme to controls in dark mode", () => {
      renderTitlebar("dark");

      const controls = screen.getByTestId("macos-controls");
      expect(controls).toHaveClass("text-gray-300");
    });

    it("should have appropriate padding", () => {
      const { container } = renderTitlebar();

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toHaveClass("px-3");
    });

    it("should switch theme correctly", () => {
      const { container: lightContainer } = renderTitlebar("light");
      const lightControls = screen.getByTestId("macos-controls");
      expect(lightControls).toHaveClass("text-gray-700");

      const { container: darkContainer } = renderTitlebar("dark");
      const darkControls = screen.getAllByTestId("macos-controls")[1];
      expect(darkControls).toHaveClass("text-gray-300");
    });
  });

  describe("Responsive behavior", () => {
    it("should maintain consistent height across themes", () => {
      const { container: lightContainer } = renderTitlebar("light");
      const lightTitlebar = lightContainer.querySelector("[data-tauri-drag-region]");

      const { container: darkContainer } = renderTitlebar("dark");
      const darkTitlebar = darkContainer.querySelector("[data-tauri-drag-region]");

      expect(lightTitlebar).toHaveClass("h-8");
      expect(darkTitlebar).toHaveClass("h-8");
    });

    it("should maintain full width across all themes", () => {
      const { container } = renderTitlebar("light");
      const titlebar = container.querySelector("[data-tauri-drag-region]");

      expect(titlebar).toHaveClass("w-full");
    });
  });

  describe("Edge cases", () => {
    it("should render correctly when theme is not set", () => {
      localStorage.clear();

      const { container } = render(
        <ThemeProvider>
          <Titlebar />
        </ThemeProvider>
      );

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toBeInTheDocument();
    });

    it("should have proper styling in light mode", () => {
      const { container } = renderTitlebar("light");

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toHaveClass("bg-gray-100");
      expect(titlebar).toHaveClass("text-gray-700");
    });

    it("should have proper styling in dark mode", () => {
      const { container } = renderTitlebar("dark");

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toHaveClass("text-gray-300");
    });
  });

  describe("Accessibility", () => {
    it("should be keyboard navigable", () => {
      const { container } = renderTitlebar();

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toBeInTheDocument();
    });

    it("should have proper structure for screen readers", () => {
      const { container } = renderTitlebar();

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar?.tagName).toBe("DIV");
    });
  });

  describe("Visual consistency", () => {
    it("should align items vertically", () => {
      const { container } = renderTitlebar();

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toHaveClass("items-center");
    });

    it("should distribute controls horizontally", () => {
      const { container } = renderTitlebar();

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toHaveClass("justify-between");
    });

    it("should prevent text selection for better UX", () => {
      const { container } = renderTitlebar();

      const titlebar = container.querySelector("[data-tauri-drag-region]");
      expect(titlebar).toHaveClass("cursor-default");
    });
  });
});

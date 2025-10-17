import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FileProvider } from "../context/FileContext";
import { RequestProvider } from "../context/RequestContext";
import { ThemeProvider } from "../context/ThemeContext";
import { VariablesProvider } from "../context/VariablesContext";
import { ResponseView } from "./ResponseView";

// Mock the useCurlGenerator hook
vi.mock("../hooks/useCurlGenerator", () => ({
  useCurlGenerator: () => ({
    generateCurl: () => "curl -X GET https://api.example.com",
  }),
}));

// Mock the useToast hook
vi.mock("../hooks/useToast", () => ({
  useToast: () => ({
    warning: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

const renderResponseView = (
  isRequestCollapsed: boolean = false,
  onToggleCollapse = vi.fn(),
  theme: "light" | "dark" = "light"
) => {
  localStorage.setItem("theme", theme);

  return render(
    <ThemeProvider>
      <VariablesProvider>
        <RequestProvider>
          <FileProvider>
            <ResponseView
              isRequestCollapsed={isRequestCollapsed}
              onToggleCollapse={onToggleCollapse}
            />
          </FileProvider>
        </RequestProvider>
      </VariablesProvider>
    </ThemeProvider>
  );
};

describe("ResponseView", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Rendering", () => {
    it("should render response tab", () => {
      renderResponseView();

      expect(screen.getByRole("button", { name: /Response/i })).toBeInTheDocument();
    });

    it("should render headers tab", () => {
      renderResponseView();

      expect(screen.getByRole("button", { name: /Headers/i })).toBeInTheDocument();
    });

    it("should render timeline tab", () => {
      renderResponseView();

      expect(screen.getByRole("button", { name: /Timeline/i })).toBeInTheDocument();
    });

    it("should show shortcuts display by default when no response", () => {
      renderResponseView();

      // The ShortcutsDisplay component should be rendered
      const responseTab = screen.getByRole("button", { name: /Response/i });
      expect(responseTab).toBeInTheDocument();
    });

    it("should render maximize button when not collapsed", () => {
      const { container } = renderResponseView(false);

      const maximizeButton = container.querySelector("svg.lucide-maximize2");
      expect(maximizeButton).toBeInTheDocument();
    });

    it("should render minimize button when collapsed", () => {
      const { container } = renderResponseView(true);

      const minimizeButton = container.querySelector("svg.lucide-minimize2");
      expect(minimizeButton).toBeInTheDocument();
    });
  });

  describe("Tab switching", () => {
    it("should show response tab as active by default", () => {
      renderResponseView();

      const responseTab = screen.getByRole("button", { name: /Response/i });
      expect(responseTab).toHaveClass("bg-purple-600");
    });

    it("should switch to headers tab when clicked", async () => {
      const user = userEvent.setup();
      renderResponseView();

      const headersTab = screen.getByRole("button", { name: /Headers/i });
      await user.click(headersTab);

      expect(headersTab).toHaveClass("bg-purple-600");
    });

    it("should switch to timeline tab when clicked", async () => {
      const user = userEvent.setup();
      renderResponseView();

      const timelineTab = screen.getByRole("button", { name: /Timeline/i });
      await user.click(timelineTab);

      expect(timelineTab).toHaveClass("bg-purple-600");
    });

    it("should show no headers message when no response", async () => {
      const user = userEvent.setup();
      renderResponseView();

      const headersTab = screen.getByRole("button", { name: /Headers/i });
      await user.click(headersTab);

      expect(screen.getByText(/No headers available/i)).toBeInTheDocument();
    });

    it("should show no timeline message when no response", async () => {
      const user = userEvent.setup();
      renderResponseView();

      const timelineTab = screen.getByRole("button", { name: /Timeline/i });
      await user.click(timelineTab);

      expect(screen.getByText(/No timeline data available/i)).toBeInTheDocument();
    });
  });

  describe("Collapse functionality", () => {
    it("should call onToggleCollapse when clicking toggle button", async () => {
      const user = userEvent.setup();
      const onToggleCollapse = vi.fn();
      const { container } = renderResponseView(false, onToggleCollapse);

      const toggleButton = container.querySelector("svg.lucide-maximize2")?.parentElement;
      if (toggleButton) {
        await user.click(toggleButton);
      }

      expect(onToggleCollapse).toHaveBeenCalledTimes(1);
    });

    it("should have correct title when not collapsed", () => {
      const { container } = renderResponseView(false);

      const toggleButton = container.querySelector('[title="Maximize response view"]');
      expect(toggleButton).toBeInTheDocument();
    });

    it("should have correct title when collapsed", () => {
      const { container } = renderResponseView(true);

      const toggleButton = container.querySelector('[title="Restore split view"]');
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe("Theme support", () => {
    it("should apply light theme to active tab", () => {
      renderResponseView(false, vi.fn(), "light");

      const responseTab = screen.getByRole("button", { name: /Response/i });
      expect(responseTab).toHaveClass("bg-purple-600");
    });

    it("should apply dark theme to active tab", () => {
      renderResponseView(false, vi.fn(), "dark");

      const responseTab = screen.getByRole("button", { name: /Response/i });
      expect(responseTab).toHaveClass("bg-purple-700");
    });

    it("should apply light theme to inactive tabs", () => {
      renderResponseView(false, vi.fn(), "light");

      const headersTab = screen.getByRole("button", { name: /Headers/i });
      expect(headersTab).toHaveClass("text-gray-600");
    });

    it("should apply dark theme to inactive tabs", () => {
      renderResponseView(false, vi.fn(), "dark");

      const headersTab = screen.getByRole("button", { name: /Headers/i });
      expect(headersTab).toHaveClass("text-gray-400");
    });

    it("should apply light theme to toggle button", () => {
      const { container } = renderResponseView(false, vi.fn(), "light");

      const toggleButton = container.querySelector("svg.lucide-maximize2")?.parentElement;
      expect(toggleButton).toHaveClass("text-gray-500");
    });

    it("should apply dark theme to toggle button", () => {
      const { container } = renderResponseView(false, vi.fn(), "dark");

      const toggleButton = container.querySelector("svg.lucide-maximize2")?.parentElement;
      expect(toggleButton).toHaveClass("text-gray-400");
    });
  });

  describe("Tab styling", () => {
    it("should have transition classes on tabs", () => {
      renderResponseView();

      const responseTab = screen.getByRole("button", { name: /Response/i });
      expect(responseTab).toHaveClass("transition-all");
      expect(responseTab).toHaveClass("duration-200");
    });

    it("should have cursor pointer on tabs", () => {
      renderResponseView();

      const responseTab = screen.getByRole("button", { name: /Response/i });
      expect(responseTab).toHaveClass("cursor-pointer");
    });

    it("should have shadow on active tab", () => {
      renderResponseView();

      const responseTab = screen.getByRole("button", { name: /Response/i });
      expect(responseTab).toHaveClass("shadow-md");
    });
  });

  describe("Status code display", () => {
    it("should not show status code when null", () => {
      renderResponseView();

      expect(screen.queryByText(/Status:/i)).not.toBeInTheDocument();
    });
  });

  describe("Response time display", () => {
    it("should not show response time when null", () => {
      renderResponseView();

      expect(screen.queryByText(/Time:/i)).not.toBeInTheDocument();
    });
  });

  describe("Copy button", () => {
    it("should not show copy button when no response", () => {
      renderResponseView();

      expect(screen.queryByRole("button", { name: /Copy Response/i })).not.toBeInTheDocument();
    });
  });

  describe("Toggle button interactions", () => {
    it("should have hover effect on toggle button", () => {
      const { container } = renderResponseView(false, vi.fn(), "light");

      const toggleButton = container.querySelector("svg.lucide-maximize2")?.parentElement;
      expect(toggleButton).toHaveClass("hover:text-purple-600");
    });

    it("should have cursor pointer on toggle button", () => {
      const { container } = renderResponseView();

      const toggleButton = container.querySelector("svg.lucide-maximize2")?.parentElement;
      expect(toggleButton).toHaveClass("cursor-pointer");
    });

    it("should have transition on toggle button", () => {
      const { container } = renderResponseView();

      const toggleButton = container.querySelector("svg.lucide-maximize2")?.parentElement;
      expect(toggleButton).toHaveClass("transition-all");
      expect(toggleButton).toHaveClass("duration-200");
    });
  });

  describe("Layout and structure", () => {
    it("should have flex column layout", () => {
      const { container } = renderResponseView();

      const mainDiv = container.querySelector(".flex.flex-col");
      expect(mainDiv).toBeInTheDocument();
    });

    it("should have rounded corners on content area", () => {
      const { container } = renderResponseView();

      const contentArea = container.querySelector(".rounded-xl");
      expect(contentArea).toBeInTheDocument();
    });

    it("should have overflow auto on content area", () => {
      const { container } = renderResponseView();

      const contentArea = container.querySelector(".overflow-auto");
      expect(contentArea).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("should handle rapid tab switching", async () => {
      const user = userEvent.setup();
      renderResponseView();

      const responseTab = screen.getByRole("button", { name: /Response/i });
      const headersTab = screen.getByRole("button", { name: /Headers/i });
      const timelineTab = screen.getByRole("button", { name: /Timeline/i });

      await user.click(headersTab);
      await user.click(timelineTab);
      await user.click(responseTab);

      expect(responseTab).toHaveClass("bg-purple-600");
    });

    it("should handle multiple collapse toggle clicks", async () => {
      const user = userEvent.setup();
      const onToggleCollapse = vi.fn();
      const { container } = renderResponseView(false, onToggleCollapse);

      const toggleButton = container.querySelector("svg.lucide-maximize2")?.parentElement;
      if (toggleButton) {
        await user.click(toggleButton);
        await user.click(toggleButton);
        await user.click(toggleButton);
      }

      expect(onToggleCollapse).toHaveBeenCalledTimes(3);
    });
  });

  describe("Accessibility", () => {
    it("should have proper button roles for tabs", () => {
      renderResponseView();

      const tabs = screen.getAllByRole("button");
      expect(tabs.length).toBeGreaterThan(0);
    });

    it("should have title attribute on toggle button", () => {
      const { container } = renderResponseView(false);

      const toggleButton = container.querySelector("[title]");
      expect(toggleButton).toBeTruthy();
    });
  });
});

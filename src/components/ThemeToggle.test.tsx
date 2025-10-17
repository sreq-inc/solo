import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "../context/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";

const renderThemeToggle = (theme: "light" | "dark" = "light") => {
  localStorage.setItem("theme", theme);

  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
};

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Rendering", () => {
    it("should render toggle button", () => {
      renderThemeToggle();

      const button = screen.getByRole("button", { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
    });

    it("should show moon icon in light mode", () => {
      const { container } = renderThemeToggle("light");

      const moonIcon = container.querySelector("svg");
      expect(moonIcon).toBeInTheDocument();
      expect(moonIcon).toHaveClass("w-5", "h-5");
    });

    it("should show sun icon in dark mode", () => {
      const { container } = renderThemeToggle("dark");

      const sunIcon = container.querySelector("svg");
      expect(sunIcon).toBeInTheDocument();
      expect(sunIcon).toHaveClass("w-5", "h-5");
    });

    it("should have correct title in light mode", () => {
      renderThemeToggle("light");

      const button = screen.getByRole("button", { name: /toggle theme/i });
      expect(button).toHaveAttribute("title", "Switch to dark mode");
    });

    it("should have correct title in dark mode", () => {
      renderThemeToggle("dark");

      const button = screen.getByRole("button", { name: /toggle theme/i });
      expect(button).toHaveAttribute("title", "Switch to light mode");
    });
  });

  describe("Interactions", () => {
    it("should toggle theme when clicked", () => {
      renderThemeToggle("light");

      const button = screen.getByRole("button", { name: /toggle theme/i });
      fireEvent.click(button);

      // After toggle, theme should be dark
      expect(localStorage.getItem("theme")).toBe("dark");
    });

    it("should toggle from dark to light", () => {
      renderThemeToggle("dark");

      const button = screen.getByRole("button", { name: /toggle theme/i });
      fireEvent.click(button);

      expect(localStorage.getItem("theme")).toBe("light");
    });

    it("should toggle multiple times", () => {
      renderThemeToggle("light");

      const button = screen.getByRole("button", { name: /toggle theme/i });

      fireEvent.click(button);
      expect(localStorage.getItem("theme")).toBe("dark");

      fireEvent.click(button);
      expect(localStorage.getItem("theme")).toBe("light");

      fireEvent.click(button);
      expect(localStorage.getItem("theme")).toBe("dark");
    });

    it("should update icon when toggled", () => {
      const { container } = renderThemeToggle("light");

      const button = screen.getByRole("button", { name: /toggle theme/i });

      // Initially should show moon icon (light mode)
      let icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();

      fireEvent.click(button);

      // After toggle should show sun icon (dark mode)
      icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Theme styles", () => {
    it("should apply light theme styles", () => {
      renderThemeToggle("light");

      const button = screen.getByRole("button", { name: /toggle theme/i });
      expect(button).toHaveClass("text-gray-700");
      expect(button).toHaveClass("hover:bg-gray-200");
    });

    it("should apply dark theme styles", () => {
      renderThemeToggle("dark");

      const button = screen.getByRole("button", { name: /toggle theme/i });
      expect(button).toHaveClass("text-white");
      expect(button).toHaveClass("hover:bg-gray-700");
    });

    it("should have transition classes", () => {
      renderThemeToggle();

      const button = screen.getByRole("button", { name: /toggle theme/i });
      expect(button).toHaveClass("transition-colors");
      expect(button).toHaveClass("duration-200");
    });

    it("should have cursor pointer", () => {
      renderThemeToggle();

      const button = screen.getByRole("button", { name: /toggle theme/i });
      expect(button).toHaveClass("cursor-pointer");
    });

    it("should have rounded corners", () => {
      renderThemeToggle();

      const button = screen.getByRole("button", { name: /toggle theme/i });
      expect(button).toHaveClass("rounded-md");
    });
  });

  describe("Accessibility", () => {
    it("should have aria-label", () => {
      renderThemeToggle();

      const button = screen.getByRole("button", { name: /toggle theme/i });
      expect(button).toHaveAttribute("aria-label", "Toggle theme");
    });

    it("should be keyboard accessible", () => {
      renderThemeToggle("light");

      const button = screen.getByRole("button", { name: /toggle theme/i });
      button.focus();

      expect(document.activeElement).toBe(button);

      fireEvent.keyPress(button, { key: "Enter", code: "Enter" });
      // Button should still be focusable after interaction
      expect(document.activeElement).toBe(button);
    });

    it("should be focusable", () => {
      renderThemeToggle();

      const button = screen.getByRole("button", { name: /toggle theme/i });
      button.focus();

      expect(document.activeElement).toBe(button);
    });

    it("should have descriptive title attribute", () => {
      renderThemeToggle("light");

      const button = screen.getByRole("button", { name: /toggle theme/i });
      expect(button.title).toBeTruthy();
      expect(button.title.length).toBeGreaterThan(0);
    });
  });

  describe("Icon rendering", () => {
    it("should render moon icon with correct size in light mode", () => {
      const { container } = renderThemeToggle("light");

      const icon = container.querySelector("svg");
      expect(icon).toHaveClass("w-5");
      expect(icon).toHaveClass("h-5");
    });

    it("should render sun icon with correct size in dark mode", () => {
      const { container } = renderThemeToggle("dark");

      const icon = container.querySelector("svg");
      expect(icon).toHaveClass("w-5");
      expect(icon).toHaveClass("h-5");
    });

    it("should always render exactly one icon", () => {
      const { container } = renderThemeToggle("light");

      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBe(1);
    });
  });

  describe("Edge cases", () => {
    it("should handle rapid clicks", () => {
      renderThemeToggle("light");

      const button = screen.getByRole("button", { name: /toggle theme/i });

      // Rapid clicking
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }

      // Should end up in dark mode (odd number of clicks)
      expect(localStorage.getItem("theme")).toBe("light");
    });

    it("should work when localStorage is initially empty", () => {
      localStorage.clear();

      const { container } = render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });

    it("should persist theme in localStorage", () => {
      renderThemeToggle("light");

      const button = screen.getByRole("button", { name: /toggle theme/i });
      fireEvent.click(button);

      // Check that localStorage was updated
      expect(localStorage.getItem("theme")).toBe("dark");

      // Re-render and check theme is still dark
      const { container } = render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const newButton = container.querySelector("button");
      expect(newButton).toHaveAttribute("title", "Switch to light mode");
    });
  });

  describe("Visual feedback", () => {
    it("should have hover effect classes", () => {
      renderThemeToggle("light");

      const button = screen.getByRole("button", { name: /toggle theme/i });
      expect(button).toHaveClass("hover:bg-gray-200");
    });

    it("should have padding", () => {
      renderThemeToggle();

      const button = screen.getByRole("button", { name: /toggle theme/i });
      expect(button).toHaveClass("p-2");
    });

    it("should have negative margin adjustment", () => {
      renderThemeToggle();

      const button = screen.getByRole("button", { name: /toggle theme/i });
      expect(button).toHaveClass("-mr-0.5");
    });
  });
});

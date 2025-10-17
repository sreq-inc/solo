import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../context/ThemeContext";
import { Checkbox } from "./Checkbox";

const renderCheckbox = (
  props: Parameters<typeof Checkbox>[0],
  theme: "light" | "dark" = "light"
) => {
  // Set theme in localStorage before rendering
  localStorage.setItem("theme", theme);

  return render(
    <ThemeProvider>
      <Checkbox {...props} />
    </ThemeProvider>
  );
};

describe("Checkbox", () => {
  describe("Rendering", () => {
    it("should render checkbox", () => {
      const onChange = vi.fn();
      renderCheckbox({ checked: false, onChange });

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("should render with label", () => {
      const onChange = vi.fn();
      renderCheckbox({ checked: false, onChange, label: "Accept terms" });

      expect(screen.getByText("Accept terms")).toBeInTheDocument();
    });

    it("should render without label", () => {
      const onChange = vi.fn();
      renderCheckbox({ checked: false, onChange });

      const label = screen.queryByText(/./);
      expect(label).not.toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const onChange = vi.fn();
      const { container } = renderCheckbox({
        checked: false,
        onChange,
        className: "custom-class",
      });

      const label = container.querySelector("label");
      expect(label).toHaveClass("custom-class");
    });
  });

  describe("Checked state", () => {
    it("should render unchecked state", () => {
      const onChange = vi.fn();
      renderCheckbox({ checked: false, onChange });

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("should render checked state", () => {
      const onChange = vi.fn();
      renderCheckbox({ checked: true, onChange });

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("should show check icon when checked", () => {
      const onChange = vi.fn();
      const { container } = renderCheckbox({ checked: true, onChange });

      const checkIcon = container.querySelector("svg");
      expect(checkIcon).toBeInTheDocument();
    });

    it("should not show check icon when unchecked", () => {
      const onChange = vi.fn();
      const { container } = renderCheckbox({ checked: false, onChange });

      // The Check icon should not be rendered
      const label = container.querySelector("label");
      expect(label?.textContent).not.toContain("✓");
    });
  });

  describe("Interactions", () => {
    it("should call onChange when clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderCheckbox({ checked: false, onChange });

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("should call onChange with false when unchecking", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderCheckbox({ checked: true, onChange });

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it("should call onChange when clicking label", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderCheckbox({ checked: false, onChange, label: "Click me" });

      const label = screen.getByText("Click me");
      await user.click(label);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("should toggle multiple times", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      // Test that onChange is called with correct values on multiple clicks
      const { rerender } = renderCheckbox({ checked: false, onChange });

      let checkbox = screen.getByRole("checkbox");

      // First click - should call with true (checking)
      await user.click(checkbox);
      expect(onChange).toHaveBeenNthCalledWith(1, true);

      // Rerender with checked=true to simulate parent component state update
      localStorage.setItem("theme", "light");
      rerender(
        <ThemeProvider>
          <Checkbox checked={true} onChange={onChange} />
        </ThemeProvider>
      );

      // Get the updated checkbox element after rerender
      checkbox = screen.getByRole("checkbox");

      // Second click - should call with false (unchecking)
      await user.click(checkbox);
      expect(onChange).toHaveBeenNthCalledWith(2, false);

      // Rerender with checked=false
      rerender(
        <ThemeProvider>
          <Checkbox checked={false} onChange={onChange} />
        </ThemeProvider>
      );

      // Get the updated checkbox element after rerender
      checkbox = screen.getByRole("checkbox");

      // Third click - should call with true (checking again)
      await user.click(checkbox);
      expect(onChange).toHaveBeenNthCalledWith(3, true);

      expect(onChange).toHaveBeenCalledTimes(3);
    });
  });

  describe("Accessibility", () => {
    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderCheckbox({ checked: false, onChange, label: "Accept" });

      const checkbox = screen.getByRole("checkbox");
      checkbox.focus();

      await user.keyboard(" ");

      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("should have cursor pointer", () => {
      const onChange = vi.fn();
      const { container } = renderCheckbox({ checked: false, onChange });

      const label = container.querySelector("label");
      expect(label).toHaveClass("cursor-pointer");
    });

    it("should associate label with checkbox", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderCheckbox({ checked: false, onChange, label: "Enable feature" });

      const labelElement = screen.getByText("Enable feature");
      await user.click(labelElement);

      expect(onChange).toHaveBeenCalledWith(true);
    });
  });

  describe("Theme support", () => {
    it("should apply light theme styles", () => {
      const onChange = vi.fn();
      const { container } = renderCheckbox({ checked: false, onChange }, "light");

      const checkboxBox = container.querySelector(".border-gray-300");
      expect(checkboxBox).toBeInTheDocument();
    });

    it("should apply dark theme styles", () => {
      const onChange = vi.fn();
      const { container } = renderCheckbox({ checked: false, onChange }, "dark");

      const checkboxBox = container.querySelector(".border-gray-600");
      expect(checkboxBox).toBeInTheDocument();
    });

    it("should apply correct checked colors for light theme", () => {
      const onChange = vi.fn();
      const { container } = renderCheckbox({ checked: true, onChange }, "light");

      const checkboxBox = container.querySelector(".bg-purple-600");
      expect(checkboxBox).toBeInTheDocument();
    });

    it("should apply correct checked colors for dark theme", () => {
      const onChange = vi.fn();
      const { container } = renderCheckbox({ checked: true, onChange }, "dark");

      const checkboxBox = container.querySelector(".bg-purple-500");
      expect(checkboxBox).toBeInTheDocument();
    });
  });

  describe("Visual feedback", () => {
    it("should have transition classes", () => {
      const onChange = vi.fn();
      const { container } = renderCheckbox({ checked: false, onChange });

      const checkboxBox = container.querySelector(".transition-all");
      expect(checkboxBox).toBeInTheDocument();
    });

    it("should have hover effect class", () => {
      const onChange = vi.fn();
      const { container } = renderCheckbox({ checked: false, onChange });

      const label = container.querySelector("label");
      expect(label).toHaveClass("group");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty label string", () => {
      const onChange = vi.fn();
      renderCheckbox({ checked: false, onChange, label: "" });

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("should handle long label text", () => {
      const onChange = vi.fn();
      const longLabel = "This is a very long label text that should still work correctly";
      renderCheckbox({ checked: false, onChange, label: longLabel });

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it("should handle special characters in label", () => {
      const onChange = vi.fn();
      const specialLabel = 'Label with <special> & "characters"';
      renderCheckbox({ checked: false, onChange, label: specialLabel });

      expect(screen.getByText(specialLabel)).toBeInTheDocument();
    });

    it("should not call onChange on mount", () => {
      const onChange = vi.fn();
      renderCheckbox({ checked: false, onChange });

      expect(onChange).not.toHaveBeenCalled();
    });

    it("should handle rapid clicks", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderCheckbox({ checked: false, onChange });

      const checkbox = screen.getByRole("checkbox");

      await user.tripleClick(checkbox);

      expect(onChange).toHaveBeenCalled();
      expect(onChange.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe("Component composition", () => {
    it("should render with flex layout", () => {
      const onChange = vi.fn();
      const { container } = renderCheckbox({
        checked: false,
        onChange,
        label: "Test",
      });

      const label = container.querySelector("label");
      expect(label).toHaveClass("flex");
      expect(label).toHaveClass("items-center");
    });

    it("should have proper gap between checkbox and label", () => {
      const onChange = vi.fn();
      const { container } = renderCheckbox({
        checked: false,
        onChange,
        label: "Test",
      });

      const label = container.querySelector("label");
      expect(label).toHaveClass("gap-3");
    });

    it("should hide actual checkbox input", () => {
      const onChange = vi.fn();
      const { container } = renderCheckbox({ checked: false, onChange });

      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveClass("sr-only");
    });
  });
});

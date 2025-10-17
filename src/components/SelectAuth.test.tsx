import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../context/ThemeContext";
import { SelectAuth } from "./SelectAuth";

const renderSelectAuth = (
  props: Parameters<typeof SelectAuth>[0],
  theme: "light" | "dark" = "light"
) => {
  localStorage.setItem("theme", theme);

  return render(
    <ThemeProvider>
      <SelectAuth {...props} />
    </ThemeProvider>
  );
};

describe("SelectAuth", () => {
  const mockOptions = [
    { label: "No Auth", value: "none" },
    { label: "Basic Auth", value: "basic" },
    { label: "Bearer Token", value: "bearer" },
  ];

  describe("Rendering", () => {
    it("should render select element", () => {
      const onChange = vi.fn();
      renderSelectAuth({ onChange, value: "none", options: mockOptions });

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("should render all options", () => {
      const onChange = vi.fn();
      renderSelectAuth({ onChange, value: "none", options: mockOptions });

      expect(screen.getByRole("option", { name: "No Auth" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Basic Auth" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Bearer Token" })).toBeInTheDocument();
    });

    it("should display correct selected value", () => {
      const onChange = vi.fn();
      renderSelectAuth({ onChange, value: "basic", options: mockOptions });

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("basic");
    });

    it("should render with custom options", () => {
      const customOptions = [
        { label: "API Key", value: "api-key" },
        { label: "OAuth", value: "oauth" },
      ];
      const onChange = vi.fn();
      renderSelectAuth({ onChange, value: "api-key", options: customOptions });

      expect(screen.getByRole("option", { name: "API Key" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "OAuth" })).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onChange when selecting an option", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelectAuth({ onChange, value: "none", options: mockOptions });

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "basic");

      expect(onChange).toHaveBeenCalledWith("basic");
    });

    it("should call onChange with correct value on each selection", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelectAuth({ onChange, value: "none", options: mockOptions });

      const select = screen.getByRole("combobox");

      await user.selectOptions(select, "basic");
      expect(onChange).toHaveBeenLastCalledWith("basic");

      await user.selectOptions(select, "bearer");
      expect(onChange).toHaveBeenLastCalledWith("bearer");

      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it("should handle selecting the same value", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelectAuth({ onChange, value: "basic", options: mockOptions });

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "basic");

      expect(onChange).toHaveBeenCalledWith("basic");
    });
  });

  describe("Theme support", () => {
    it("should apply light theme styles", () => {
      const onChange = vi.fn();
      renderSelectAuth({ onChange, value: "none", options: mockOptions }, "light");

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("bg-white");
      expect(select).toHaveClass("text-gray-700");
      expect(select).toHaveClass("border-gray-300");
    });

    it("should apply dark theme styles", () => {
      const onChange = vi.fn();
      renderSelectAuth({ onChange, value: "none", options: mockOptions }, "dark");

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("bg-gray-700");
      expect(select).toHaveClass("text-white");
      expect(select).toHaveClass("border-gray-600");
    });

    it("should have focus styles", () => {
      const onChange = vi.fn();
      renderSelectAuth({ onChange, value: "none", options: mockOptions });

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("focus:outline-none");
      expect(select).toHaveClass("focus:ring-1");
      expect(select).toHaveClass("focus:border-purple-500");
      expect(select).toHaveClass("focus:ring-purple-500");
    });
  });

  describe("Accessibility", () => {
    it("should be keyboard navigable", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelectAuth({ onChange, value: "none", options: mockOptions });

      const select = screen.getByRole("combobox");
      select.focus();

      expect(document.activeElement).toBe(select);

      // Select elements can be navigated with arrow keys and space
      await user.keyboard(" "); // Open select

      // The select element is keyboard accessible
      expect(select).toBeInTheDocument();
    });

    it("should have proper ARIA role", () => {
      const onChange = vi.fn();
      renderSelectAuth({ onChange, value: "none", options: mockOptions });

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("should handle empty options array", () => {
      const onChange = vi.fn();
      renderSelectAuth({ onChange, value: "", options: [] });

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
      expect(select.children.length).toBe(0);
    });

    it("should handle single option", () => {
      const singleOption = [{ label: "Only Option", value: "only" }];
      const onChange = vi.fn();
      renderSelectAuth({ onChange, value: "only", options: singleOption });

      expect(screen.getByRole("option", { name: "Only Option" })).toBeInTheDocument();
    });

    it("should handle long option labels", () => {
      const longOptions = [
        {
          label: "This is a very long authentication option label that might wrap",
          value: "long",
        },
      ];
      const onChange = vi.fn();
      renderSelectAuth({ onChange, value: "long", options: longOptions });

      expect(screen.getByRole("option", { name: /This is a very long/ })).toBeInTheDocument();
    });

    it("should handle special characters in labels", () => {
      const specialOptions = [{ label: 'Auth & <Special> "Characters"', value: "special" }];
      const onChange = vi.fn();
      renderSelectAuth({ onChange, value: "special", options: specialOptions });

      expect(
        screen.getByRole("option", { name: 'Auth & <Special> "Characters"' })
      ).toBeInTheDocument();
    });
  });

  describe("Controlled component behavior", () => {
    it("should update when value prop changes", () => {
      const onChange = vi.fn();
      const { rerender } = renderSelectAuth({
        onChange,
        value: "none",
        options: mockOptions,
      });

      let select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("none");

      localStorage.setItem("theme", "light");
      rerender(
        <ThemeProvider>
          <SelectAuth onChange={onChange} value="basic" options={mockOptions} />
        </ThemeProvider>
      );

      select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("basic");
    });

    it("should not call onChange on mount", () => {
      const onChange = vi.fn();
      renderSelectAuth({ onChange, value: "none", options: mockOptions });

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});

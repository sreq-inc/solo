import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../context/ThemeContext";
import { SelectMethod } from "./SelectMethod";

const renderSelectMethod = (
  props: Parameters<typeof SelectMethod>[0],
  theme: "light" | "dark" = "light"
) => {
  localStorage.setItem("theme", theme);

  return render(
    <ThemeProvider>
      <SelectMethod {...props} />
    </ThemeProvider>
  );
};

describe("SelectMethod", () => {
  const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

  describe("Rendering", () => {
    it("should render select element", () => {
      const onChange = vi.fn();
      renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("should render all HTTP method options", () => {
      const onChange = vi.fn();
      renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      httpMethods.forEach((method) => {
        expect(screen.getByRole("option", { name: method })).toBeInTheDocument();
      });
    });

    it("should display selected method", () => {
      const onChange = vi.fn();
      renderSelectMethod({ value: "POST", options: httpMethods, onChange });

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("POST");
    });

    it("should have title attribute with current method", () => {
      const onChange = vi.fn();
      renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("title", "HTTP Method: GET");
    });

    it("should render dropdown arrow icon", () => {
      const onChange = vi.fn();
      const { container } = renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const arrow = container.querySelector("svg");
      expect(arrow).toBeInTheDocument();
      expect(arrow).toHaveClass("w-4", "h-4");
    });
  });

  describe("Interactions", () => {
    it("should call onChange when selecting a method", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "POST");

      expect(onChange).toHaveBeenCalledWith("POST");
    });

    it("should call onChange with correct value for each selection", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const select = screen.getByRole("combobox");

      await user.selectOptions(select, "POST");
      expect(onChange).toHaveBeenLastCalledWith("POST");

      await user.selectOptions(select, "DELETE");
      expect(onChange).toHaveBeenLastCalledWith("DELETE");

      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it("should handle selecting all methods", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const select = screen.getByRole("combobox");

      for (const method of httpMethods) {
        await user.selectOptions(select, method);
      }

      expect(onChange).toHaveBeenCalledTimes(httpMethods.length);
    });
  });

  describe("Theme support", () => {
    it("should apply light theme styles", () => {
      const onChange = vi.fn();
      renderSelectMethod({ value: "GET", options: httpMethods, onChange }, "light");

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("text-gray-700");
      expect(select).toHaveClass("bg-white");
      expect(select).toHaveClass("border-purple-500");
    });

    it("should apply dark theme styles", () => {
      const onChange = vi.fn();
      renderSelectMethod({ value: "GET", options: httpMethods, onChange }, "dark");

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("text-white");
      expect(select).toHaveClass("bg-[#10121b]");
      expect(select).toHaveClass("border-purple-500");
    });

    it("should apply light theme to arrow icon", () => {
      const onChange = vi.fn();
      const { container } = renderSelectMethod(
        { value: "GET", options: httpMethods, onChange },
        "light"
      );

      const arrow = container.querySelector("svg");
      expect(arrow).toHaveClass("text-gray-500");
    });

    it("should apply dark theme to arrow icon", () => {
      const onChange = vi.fn();
      const { container } = renderSelectMethod(
        { value: "GET", options: httpMethods, onChange },
        "dark"
      );

      const arrow = container.querySelector("svg");
      expect(arrow).toHaveClass("text-gray-400");
    });

    it("should have focus ring styles", () => {
      const onChange = vi.fn();
      renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("focus:outline-none");
      expect(select).toHaveClass("focus:ring-1");
      expect(select).toHaveClass("ring-purple-500");
    });
  });

  describe("Layout and styling", () => {
    it("should have fixed width container", () => {
      const onChange = vi.fn();
      const { container } = renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const wrapper = container.querySelector(".w-28");
      expect(wrapper).toBeInTheDocument();
    });

    it("should not shrink", () => {
      const onChange = vi.fn();
      const { container } = renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const wrapper = container.querySelector(".flex-shrink-0");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have relative positioning for dropdown arrow", () => {
      const onChange = vi.fn();
      const { container } = renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const relative = container.querySelector(".relative");
      expect(relative).toBeInTheDocument();
    });

    it("should have cursor pointer", () => {
      const onChange = vi.fn();
      renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("cursor-pointer");
    });

    it("should have rounded borders", () => {
      const onChange = vi.fn();
      renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("rounded-lg");
    });

    it("should have border-2 thickness", () => {
      const onChange = vi.fn();
      renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("border-2");
    });
  });

  describe("Accessibility", () => {
    it("should be keyboard navigable", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const select = screen.getByRole("combobox");
      select.focus();

      expect(document.activeElement).toBe(select);

      // Select elements can be navigated with keyboard
      await user.keyboard(" "); // Open select

      // The select element is keyboard accessible
      expect(select).toBeInTheDocument();
    });

    it("should have proper combobox role", () => {
      const onChange = vi.fn();
      renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("should be focusable", () => {
      const onChange = vi.fn();
      renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const select = screen.getByRole("combobox");
      select.focus();

      expect(document.activeElement).toBe(select);
    });

    it("should have descriptive title", () => {
      const onChange = vi.fn();
      renderSelectMethod({ value: "PUT", options: httpMethods, onChange });

      const select = screen.getByRole("combobox");
      expect(select.title).toContain("PUT");
    });
  });

  describe("Edge cases", () => {
    it("should handle custom method options", () => {
      const customMethods = ["CUSTOM", "SPECIAL"];
      const onChange = vi.fn();
      renderSelectMethod({ value: "CUSTOM", options: customMethods, onChange });

      expect(screen.getByRole("option", { name: "CUSTOM" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "SPECIAL" })).toBeInTheDocument();
    });

    it("should handle single option", () => {
      const onChange = vi.fn();
      renderSelectMethod({ value: "GET", options: ["GET"], onChange });

      expect(screen.getByRole("option", { name: "GET" })).toBeInTheDocument();
      expect(screen.getAllByRole("option").length).toBe(1);
    });

    it("should handle empty options array", () => {
      const onChange = vi.fn();
      renderSelectMethod({ value: "", options: [], onChange });

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
      expect(select.children.length).toBe(0);
    });

    it("should handle long method names", () => {
      const longMethods = ["VERY_LONG_METHOD_NAME"];
      const onChange = vi.fn();
      renderSelectMethod({ value: "VERY_LONG_METHOD_NAME", options: longMethods, onChange });

      expect(screen.getByRole("option", { name: "VERY_LONG_METHOD_NAME" })).toBeInTheDocument();
    });
  });

  describe("Controlled component behavior", () => {
    it("should update when value prop changes", () => {
      const onChange = vi.fn();
      const { rerender } = renderSelectMethod({
        value: "GET",
        options: httpMethods,
        onChange,
      });

      let select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("GET");

      localStorage.setItem("theme", "light");
      rerender(
        <ThemeProvider>
          <SelectMethod value="POST" options={httpMethods} onChange={onChange} />
        </ThemeProvider>
      );

      select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("POST");
    });

    it("should update title when value changes", () => {
      const onChange = vi.fn();
      const { rerender } = renderSelectMethod({
        value: "GET",
        options: httpMethods,
        onChange,
      });

      let select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("title", "HTTP Method: GET");

      localStorage.setItem("theme", "light");
      rerender(
        <ThemeProvider>
          <SelectMethod value="DELETE" options={httpMethods} onChange={onChange} />
        </ThemeProvider>
      );

      select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("title", "HTTP Method: DELETE");
    });

    it("should not call onChange on mount", () => {
      const onChange = vi.fn();
      renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("Dropdown arrow", () => {
    it("should render arrow with pointer-events-none", () => {
      const onChange = vi.fn();
      const { container } = renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const arrowContainer = container.querySelector(".pointer-events-none");
      expect(arrowContainer).toBeInTheDocument();
    });

    it("should position arrow on the right", () => {
      const onChange = vi.fn();
      const { container } = renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const arrowContainer = container.querySelector(".absolute.inset-y-0.right-0");
      expect(arrowContainer).toBeInTheDocument();
    });

    it("should render chevron down arrow", () => {
      const onChange = vi.fn();
      const { container } = renderSelectMethod({ value: "GET", options: httpMethods, onChange });

      const arrow = container.querySelector("svg path");
      expect(arrow).toHaveAttribute("d", "M19 9l-7 7-7-7");
    });
  });
});

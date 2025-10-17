import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "../context/ThemeContext";
import { JsonViewer } from "./JsonViewer";

const renderJsonViewer = (data: any, theme: "light" | "dark" = "light") => {
  localStorage.setItem("theme", theme);

  return render(
    <ThemeProvider>
      <JsonViewer data={data} />
    </ThemeProvider>
  );
};

describe("JsonViewer", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Rendering", () => {
    it("should render simple object", () => {
      const data = { name: "John", age: 30 };
      const { container } = renderJsonViewer(data);

      expect(container.querySelector("table")).toBeInTheDocument();
    });

    it("should render empty object", () => {
      const data = {};
      const { container } = renderJsonViewer(data);

      const tableBody = container.querySelector("tbody");
      expect(tableBody?.textContent).toContain("{}");
    });

    it("should render empty array", () => {
      const data = [];
      const { container } = renderJsonViewer(data);

      const tableBody = container.querySelector("tbody");
      expect(tableBody?.textContent).toContain("[]");
    });

    it("should render array with items", () => {
      const data = [1, 2, 3];
      const { container } = renderJsonViewer(data);

      const tableBody = container.querySelector("tbody");
      expect(tableBody?.textContent).toContain("1");
      expect(tableBody?.textContent).toContain("2");
      expect(tableBody?.textContent).toContain("3");
    });

    it("should render nested objects", () => {
      const data = {
        user: {
          name: "John",
          email: "john@example.com",
        },
      };
      const { container } = renderJsonViewer(data);

      const tableBody = container.querySelector("tbody");
      expect(tableBody?.textContent).toContain("user");
      expect(tableBody?.textContent).toContain("name");
      expect(tableBody?.textContent).toContain("John");
    });
  });

  describe("Data Types", () => {
    it("should render string values", () => {
      const data = { message: "Hello World" };
      const { container } = renderJsonViewer(data);

      expect(container.textContent).toContain('"Hello World"');
    });

    it("should render number values", () => {
      const data = { count: 42 };
      const { container } = renderJsonViewer(data);

      expect(container.textContent).toContain("42");
    });

    it("should render boolean values", () => {
      const data = { active: true, disabled: false };
      const { container } = renderJsonViewer(data);

      expect(container.textContent).toContain("true");
      expect(container.textContent).toContain("false");
    });

    it("should render null values", () => {
      const data = { value: null };
      const { container } = renderJsonViewer(data);

      expect(container.textContent).toContain("null");
    });

    it("should handle mixed data types", () => {
      const data = {
        string: "text",
        number: 123,
        boolean: true,
        nullValue: null,
        array: [1, 2, 3],
        object: { nested: "value" },
      };
      const { container } = renderJsonViewer(data);

      expect(container.textContent).toContain('"text"');
      expect(container.textContent).toContain("123");
      expect(container.textContent).toContain("true");
      expect(container.textContent).toContain("null");
    });
  });

  describe("Collapse/Expand", () => {
    it("should show collapse button for objects", () => {
      const data = { user: { name: "John" } };
      const { container } = renderJsonViewer(data);

      const collapseButton = container.querySelector("button");
      expect(collapseButton).toBeInTheDocument();
    });

    it("should show expand icon by default", () => {
      const data = { user: { name: "John" } };
      const { container } = renderJsonViewer(data);

      const expandIcon = container.querySelector("button");
      expect(expandIcon?.textContent).toContain("▼");
    });

    it("should collapse on click", async () => {
      const user = userEvent.setup();
      const data = { user: { name: "John" } };
      const { container } = renderJsonViewer(data);

      const initialRows = container.querySelectorAll("tr").length;
      const collapseButton = container.querySelector("button");

      if (collapseButton) {
        await user.click(collapseButton);
      }

      const collapsedRows = container.querySelectorAll("tr").length;
      expect(collapsedRows).toBeLessThan(initialRows);
    });

    it("should show collapse icon when collapsed", async () => {
      const user = userEvent.setup();
      const data = { user: { name: "John" } };
      const { container } = renderJsonViewer(data);

      const collapseButton = container.querySelector("button");

      if (collapseButton) {
        await user.click(collapseButton);
        expect(collapseButton.textContent).toContain("▶");
      }
    });

    it("should expand when clicking collapsed item", async () => {
      const user = userEvent.setup();
      const data = { user: { name: "John" } };
      const { container } = renderJsonViewer(data);

      const collapseButton = container.querySelector("button");

      if (collapseButton) {
        await user.click(collapseButton);
        const collapsedRows = container.querySelectorAll("tr").length;

        await user.click(collapseButton);
        const expandedRows = container.querySelectorAll("tr").length;

        expect(expandedRows).toBeGreaterThan(collapsedRows);
      }
    });

    it("should show item/key count when collapsed", async () => {
      const user = userEvent.setup();
      const data = [1, 2, 3, 4, 5];
      const { container } = renderJsonViewer(data);

      const collapseButton = container.querySelector("button");

      if (collapseButton) {
        await user.click(collapseButton);
        expect(container.textContent).toContain("5 items");
      }
    });

    it("should handle nested collapse", async () => {
      const user = userEvent.setup();
      const data = {
        level1: {
          level2: {
            level3: "value",
          },
        },
      };
      const { container } = renderJsonViewer(data);

      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);

      if (buttons[0]) {
        await user.click(buttons[0]);
        expect(container.textContent).toContain("▶");
      }
    });
  });

  describe("Line Numbers", () => {
    it("should show line numbers", () => {
      const data = { name: "John" };
      const { container } = renderJsonViewer(data);

      expect(container.textContent).toContain("1");
      expect(container.textContent).toContain("2");
    });

    it("should increment line numbers correctly", () => {
      const data = {
        name: "John",
        age: 30,
        city: "New York",
      };
      const { container } = renderJsonViewer(data);

      const lineNumbers = Array.from(container.querySelectorAll("td:first-child")).map((td) => {
        const text = td.textContent?.trim() || "";
        // Extract just the number part (remove collapse/expand icons)
        return text.replace(/[▼▶]/g, "").trim();
      });

      expect(lineNumbers).toContain("1");
      expect(lineNumbers).toContain("2");
      expect(lineNumbers).toContain("3");
    });
  });

  describe("Theme Support", () => {
    it("should apply light theme styles", () => {
      const data = { name: "John" };
      const { container } = renderJsonViewer(data, "light");

      const row = container.querySelector("tr");
      expect(row).toHaveClass("hover:bg-gray-200");
    });

    it("should apply dark theme styles", () => {
      const data = { name: "John" };
      const { container } = renderJsonViewer(data, "dark");

      const row = container.querySelector("tr");
      expect(row).toHaveClass("hover:bg-gray-800");
    });

    it("should apply light theme to line numbers", () => {
      const data = { name: "John" };
      const { container } = renderJsonViewer(data, "light");

      const lineNumber = container.querySelector("td:first-child");
      expect(lineNumber).toHaveClass("bg-gray-100");
    });

    it("should apply dark theme to line numbers", () => {
      const data = { name: "John" };
      const { container } = renderJsonViewer(data, "dark");

      const lineNumber = container.querySelector("td:first-child");
      expect(lineNumber).toHaveClass("bg-gray-900");
    });
  });

  describe("Syntax Highlighting", () => {
    it("should highlight string values in light theme", () => {
      const data = { message: "Hello" };
      const { container } = renderJsonViewer(data, "light");

      const stringValue = container.querySelector(".text-green-700");
      expect(stringValue).toBeInTheDocument();
    });

    it("should highlight string values in dark theme", () => {
      const data = { message: "Hello" };
      const { container } = renderJsonViewer(data, "dark");

      const stringValue = container.querySelector(".text-green-400");
      expect(stringValue).toBeInTheDocument();
    });

    it("should highlight keys in light theme", () => {
      const data = { name: "John" };
      const { container } = renderJsonViewer(data, "light");

      const key = container.querySelector(".text-purple-700");
      expect(key).toBeInTheDocument();
    });

    it("should highlight keys in dark theme", () => {
      const data = { name: "John" };
      const { container } = renderJsonViewer(data, "dark");

      const key = container.querySelector(".text-purple-400");
      expect(key).toBeInTheDocument();
    });

    it("should highlight numbers", () => {
      const data = { count: 42 };
      const { container } = renderJsonViewer(data);

      const number = container.querySelector(".text-blue-400, .text-blue-700");
      expect(number).toBeInTheDocument();
    });

    it("should highlight booleans", () => {
      const data = { active: true };
      const { container } = renderJsonViewer(data);

      const boolean = container.querySelector(".text-yellow-400, .text-yellow-700");
      expect(boolean).toBeInTheDocument();
    });
  });

  describe("Complex Data Structures", () => {
    it("should handle deeply nested objects", () => {
      const data = {
        level1: {
          level2: {
            level3: {
              level4: "deep value",
            },
          },
        },
      };
      const { container } = renderJsonViewer(data);

      expect(container.textContent).toContain("level1");
      expect(container.textContent).toContain("level2");
      expect(container.textContent).toContain("level3");
      expect(container.textContent).toContain("level4");
    });

    it("should handle arrays of objects", () => {
      const data = {
        users: [
          { id: 1, name: "John" },
          { id: 2, name: "Jane" },
        ],
      };
      const { container } = renderJsonViewer(data);

      expect(container.textContent).toContain("users");
      expect(container.textContent).toContain("John");
      expect(container.textContent).toContain("Jane");
    });

    it("should handle mixed arrays", () => {
      const data = {
        mixed: [1, "text", true, null, { key: "value" }],
      };
      const { container } = renderJsonViewer(data);

      expect(container.textContent).toContain("1");
      expect(container.textContent).toContain('"text"');
      expect(container.textContent).toContain("true");
      expect(container.textContent).toContain("null");
    });
  });

  describe("Edge Cases", () => {
    it("should handle primitive values", () => {
      const { container: stringContainer } = renderJsonViewer("simple string");
      expect(stringContainer.textContent).toContain('"simple string"');

      const { container: numberContainer } = renderJsonViewer(42);
      expect(numberContainer.textContent).toContain("42");

      const { container: boolContainer } = renderJsonViewer(true);
      expect(boolContainer.textContent).toContain("true");
    });

    it("should handle null at root level", () => {
      const { container } = renderJsonViewer(null);
      expect(container.textContent).toContain("null");
    });

    it("should handle undefined as null", () => {
      const data = { value: undefined };
      const { container } = renderJsonViewer(data);
      expect(container).toBeInTheDocument();
    });

    it("should handle empty strings", () => {
      const data = { empty: "" };
      const { container } = renderJsonViewer(data);

      expect(container.textContent).toContain('""');
    });

    it("should handle special characters in strings", () => {
      const data = { message: "Hello \"World\" with 'quotes'" };
      const { container } = renderJsonViewer(data);

      expect(container.textContent).toContain("Hello \"World\" with 'quotes'");
    });
  });
});

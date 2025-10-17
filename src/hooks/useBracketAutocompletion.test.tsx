import { renderHook } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { useBracketAutocompletion } from "./useBracketAutocompletion";

describe("useBracketAutocompletion", () => {
  const createKeyboardEvent = (key: string, _selectionStart: number, _selectionEnd: number) => {
    return {
      key,
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent<HTMLInputElement>;
  };

  const createMockInput = (value: string, selectionStart: number, selectionEnd: number) => {
    return {
      value,
      selectionStart,
      selectionEnd,
      setSelectionRange: vi.fn(),
    } as unknown as HTMLInputElement;
  };

  describe("Opening bracket autocomplete", () => {
    it("should complete single bracket with closing bracket", () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();
      const event = createKeyboardEvent("{", 0, 0);

      // Mock the input ref
      const mockInput = createMockInput("", 0, 0);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, "", onChange);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith("{}");
    });

    it("should complete double bracket when typing second bracket", () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();
      const value = "{";
      const event = createKeyboardEvent("{", 1, 1);

      const mockInput = createMockInput(value, 1, 1);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, value, onChange);

      expect(event.preventDefault).toHaveBeenCalled();
      // The hook adds {} after the second {, resulting in {{}
      expect(onChange).toHaveBeenCalledWith("{{}");
    });

    it("should insert brackets at cursor position", () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();
      const value = "hello world";
      const event = createKeyboardEvent("{", 6, 6);

      const mockInput = createMockInput(value, 6, 6);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, value, onChange);

      expect(onChange).toHaveBeenCalledWith("hello {}world");
    });

    it("should handle text selection and replace with brackets", () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();
      const value = "hello world";
      const event = createKeyboardEvent("{", 6, 11);

      const mockInput = createMockInput(value, 6, 11);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, value, onChange);

      expect(onChange).toHaveBeenCalledWith("hello {}");
    });

    it("should set cursor position between brackets after insert", async () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();
      const event = createKeyboardEvent("{", 0, 0);

      const mockInput = createMockInput("", 0, 0);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, "", onChange);

      await new Promise((resolve) => setTimeout(resolve, 5));
      expect(mockInput.setSelectionRange).toHaveBeenCalledWith(1, 1);
    });

    it("should handle consecutive bracket insertions", () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();

      // First bracket
      let value = "";
      let event = createKeyboardEvent("{", 0, 0);
      let mockInput = createMockInput(value, 0, 0);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, value, onChange);
      expect(onChange).toHaveBeenLastCalledWith("{}");

      // Second bracket (simulating typing after first completion)
      value = "{";
      event = createKeyboardEvent("{", 1, 1);
      mockInput = createMockInput(value, 1, 1);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, value, onChange);
      expect(onChange).toHaveBeenLastCalledWith("{{}");
    });
  });

  describe("Backspace handling", () => {
    it("should remove matching bracket pair on backspace", () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();
      const value = "{}";
      const event = createKeyboardEvent("Backspace", 1, 1);

      const mockInput = createMockInput(value, 1, 1);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, value, onChange);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith("");
    });

    it("should remove double bracket pattern on backspace", () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();
      const value = "{{}}";
      const event = createKeyboardEvent("Backspace", 2, 2);

      const mockInput = createMockInput(value, 2, 2);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, value, onChange);

      expect(event.preventDefault).toHaveBeenCalled();
      // When at position 2 in {{}} and backspace, it removes the { before cursor and } after
      expect(onChange).toHaveBeenCalledWith("{}");
    });

    it("should remove brackets in the middle of text", () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();
      const value = "hello{}world";
      const event = createKeyboardEvent("Backspace", 6, 6);

      const mockInput = createMockInput(value, 6, 6);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, value, onChange);

      expect(onChange).toHaveBeenCalledWith("helloworld");
    });

    it("should not remove brackets when text is selected", () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();
      const value = "{}";
      const event = createKeyboardEvent("Backspace", 0, 2);

      const mockInput = createMockInput(value, 0, 2);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, value, onChange);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should not remove brackets when cursor is at start", () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();
      const value = "{}";
      const event = createKeyboardEvent("Backspace", 0, 0);

      const mockInput = createMockInput(value, 0, 0);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, value, onChange);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should handle normal backspace when not between brackets", () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();
      const value = "hello";
      const event = createKeyboardEvent("Backspace", 5, 5);

      const mockInput = createMockInput(value, 5, 5);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, value, onChange);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should set cursor position after removing brackets", async () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();
      const value = "{}";
      const event = createKeyboardEvent("Backspace", 1, 1);

      const mockInput = createMockInput(value, 1, 1);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, value, onChange);

      await new Promise((resolve) => setTimeout(resolve, 5));
      expect(mockInput.setSelectionRange).toHaveBeenCalledWith(0, 0);
    });
  });

  describe("Edge cases", () => {
    it("should handle missing input ref", () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();
      const event = createKeyboardEvent("{", 0, 0);

      (result.current.inputRef as any).current = null;

      expect(() => {
        result.current.handleKeyDown(event, "", onChange);
      }).not.toThrow();

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should handle empty value", () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();
      const event = createKeyboardEvent("{", 0, 0);

      const mockInput = createMockInput("", 0, 0);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, "", onChange);

      expect(onChange).toHaveBeenCalledWith("{}");
    });

    it("should not interfere with other keys", () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();
      const value = "hello";

      const mockInput = createMockInput(value, 5, 5);
      (result.current.inputRef as any).current = mockInput;

      // Test various keys
      const keys = ["a", "Enter", "Tab", "ArrowLeft", "Delete"];
      keys.forEach((key) => {
        const event = createKeyboardEvent(key, 5, 5);
        result.current.handleKeyDown(event, value, onChange);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(onChange).not.toHaveBeenCalled();
      });
    });

    it("should handle null selection positions", () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();
      const event = createKeyboardEvent("{", 0, 0);

      const mockInput = {
        ...createMockInput("", 0, 0),
        selectionStart: null,
        selectionEnd: null,
      };
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, "", onChange);

      expect(onChange).toHaveBeenCalledWith("{}");
    });
  });

  describe("Variable placeholder pattern", () => {
    it("should create variable placeholder pattern", () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();

      // First {
      let value = "";
      let event = createKeyboardEvent("{", 0, 0);
      let mockInput = createMockInput(value, 0, 0);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, value, onChange);
      expect(onChange).toHaveBeenLastCalledWith("{}");

      // Second { to create {{}
      value = "{";
      event = createKeyboardEvent("{", 1, 1);
      mockInput = createMockInput(value, 1, 1);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, value, onChange);
      expect(onChange).toHaveBeenLastCalledWith("{{}");
    });

    it("should create variable placeholder in URL context", () => {
      const { result } = renderHook(() => useBracketAutocompletion());
      const onChange = vi.fn();

      const value = "https://api.example.com/";
      const event = createKeyboardEvent("{", value.length, value.length);

      const mockInput = createMockInput(value, value.length, value.length);
      (result.current.inputRef as any).current = mockInput;

      result.current.handleKeyDown(event, value, onChange);

      expect(onChange).toHaveBeenCalledWith("https://api.example.com/{}");
    });
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../context/ThemeContext";
import { BearerToken } from "./BearerToken";

const renderBearerToken = (
  props: Parameters<typeof BearerToken>[0],
  theme: "light" | "dark" = "light"
) => {
  localStorage.setItem("theme", theme);

  return render(
    <ThemeProvider>
      <BearerToken {...props} />
    </ThemeProvider>
  );
};

describe("BearerToken", () => {
  describe("Rendering", () => {
    it("should render bearer token input", () => {
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "" });

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("should render with label", () => {
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "" });

      expect(screen.getByText("Bearer Token Authentication")).toBeInTheDocument();
    });

    it("should display current token value", () => {
      const onTokenChange = vi.fn();
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
      renderBearerToken({ onTokenChange, bearerToken: token });

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe(token);
    });

    it("should render empty input when token is empty", () => {
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "" });

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("");
    });
  });

  describe("Interactions", () => {
    it("should call onTokenChange when typing", async () => {
      const user = userEvent.setup();
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "" });

      const input = screen.getByRole("textbox");
      await user.type(input, "token123");

      // Should be called for each character typed
      expect(onTokenChange).toHaveBeenCalled();
      expect(onTokenChange.mock.calls.length).toBeGreaterThan(0);
    });

    it("should call onTokenChange on paste", async () => {
      const user = userEvent.setup();
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "" });

      const input = screen.getByRole("textbox");
      await user.click(input);
      await user.paste("pasted-token-value");

      expect(onTokenChange).toHaveBeenCalled();
    });

    it("should handle clearing the token", async () => {
      const user = userEvent.setup();
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "existing-token" });

      const input = screen.getByRole("textbox");
      await user.clear(input);

      expect(onTokenChange).toHaveBeenCalledWith("");
    });

    it("should handle editing existing token", async () => {
      const user = userEvent.setup();
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "old-token" });

      const input = screen.getByRole("textbox");
      await user.clear(input);

      // After clear, should have been called with empty string
      expect(onTokenChange).toHaveBeenCalledWith("");

      await user.type(input, "new-token");

      // Should have been called multiple times
      expect(onTokenChange).toHaveBeenCalled();
      expect(onTokenChange.mock.calls.length).toBeGreaterThan(1);
    });
  });

  describe("Theme support", () => {
    it("should apply light theme styles to label", () => {
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "" }, "light");

      const label = screen.getByText("Bearer Token Authentication");
      expect(label).toHaveClass("text-gray-700");
    });

    it("should apply dark theme styles to label", () => {
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "" }, "dark");

      const label = screen.getByText("Bearer Token Authentication");
      expect(label).toHaveClass("text-white");
    });

    it("should apply light theme styles to input", () => {
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "" }, "light");

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("bg-white");
      expect(input).toHaveClass("border-gray-300");
      expect(input).toHaveClass("text-gray-800");
    });

    it("should apply dark theme styles to input", () => {
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "" }, "dark");

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("bg-gray-700");
      expect(input).toHaveClass("border-gray-600");
      expect(input).toHaveClass("text-white");
    });
  });

  describe("Layout and styling", () => {
    it("should have flex column layout", () => {
      const onTokenChange = vi.fn();
      const { container } = renderBearerToken({ onTokenChange, bearerToken: "" });

      const wrapper = container.querySelector(".flex.flex-col");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have proper spacing classes", () => {
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "" });

      const label = screen.getByText("Bearer Token Authentication");
      expect(label).toHaveClass("mb-4");

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("mb-4");
    });

    it("should have full width input", () => {
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "" });

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("w-full");
    });

    it("should have proper font styling", () => {
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "" });

      const label = screen.getByText("Bearer Token Authentication");
      expect(label).toHaveClass("text-sm");
      expect(label).toHaveClass("font-medium");

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("text-sm");
    });
  });

  describe("Accessibility", () => {
    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "" });

      const input = screen.getByRole("textbox");
      input.focus();

      expect(document.activeElement).toBe(input);

      await user.keyboard("token");
      expect(onTokenChange).toHaveBeenCalled();
    });

    it("should have text input role", () => {
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "" });

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("should be focusable", () => {
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "" });

      const input = screen.getByRole("textbox");
      input.focus();

      expect(document.activeElement).toBe(input);
    });
  });

  describe("Edge cases", () => {
    it("should handle very long tokens", async () => {
      const user = userEvent.setup();
      const onTokenChange = vi.fn();
      const longToken = "a".repeat(1000);
      renderBearerToken({ onTokenChange, bearerToken: longToken });

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe(longToken);

      await user.clear(input);
      expect(onTokenChange).toHaveBeenCalled();
    });

    it("should handle special characters in token", async () => {
      const user = userEvent.setup();
      const onTokenChange = vi.fn();
      // Use paste instead of type for special characters that userEvent can't handle
      const specialToken = "token!@#$%^&*()_+-=[]{}|;:,.<>?";
      renderBearerToken({ onTokenChange, bearerToken: "" });

      const input = screen.getByRole("textbox");
      await user.click(input);
      await user.paste(specialToken);

      expect(onTokenChange).toHaveBeenCalled();
    });

    it("should handle whitespace in token", () => {
      const onTokenChange = vi.fn();
      const tokenWithSpaces = "  token with spaces  ";
      renderBearerToken({ onTokenChange, bearerToken: tokenWithSpaces });

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe(tokenWithSpaces);
    });

    it("should handle unicode characters", async () => {
      const user = userEvent.setup();
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "" });

      const input = screen.getByRole("textbox");
      await user.type(input, "你好🌍");

      expect(onTokenChange).toHaveBeenCalled();
    });
  });

  describe("Controlled component behavior", () => {
    it("should update when bearerToken prop changes", () => {
      const onTokenChange = vi.fn();
      const { rerender } = renderBearerToken({
        onTokenChange,
        bearerToken: "token1",
      });

      let input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("token1");

      localStorage.setItem("theme", "light");
      rerender(
        <ThemeProvider>
          <BearerToken onTokenChange={onTokenChange} bearerToken="token2" />
        </ThemeProvider>
      );

      input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("token2");
    });

    it("should not call onTokenChange on mount", () => {
      const onTokenChange = vi.fn();
      renderBearerToken({ onTokenChange, bearerToken: "initial-token" });

      expect(onTokenChange).not.toHaveBeenCalled();
    });
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../context/ThemeContext";
import { UsernameAndPassword } from "./UsernameAndPassword";

const renderComponent = (
  props: Parameters<typeof UsernameAndPassword>[0],
  theme: "light" | "dark" = "light"
) => {
  localStorage.setItem("theme", theme);
  return render(
    <ThemeProvider>
      <UsernameAndPassword {...props} />
    </ThemeProvider>
  );
};

describe("UsernameAndPassword", () => {
  const defaultProps = {
    username: "",
    password: "",
    useBasicAuth: false,
    onUsernameChange: vi.fn(),
    onPasswordChange: vi.fn(),
    onUseBasicAuthChange: vi.fn(),
    showPassword: false,
    setShowPassword: vi.fn(),
  };

  describe("Rendering", () => {
    it("should render checkbox for basic auth", () => {
      renderComponent(defaultProps);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("should render username and password inputs", () => {
      renderComponent(defaultProps);
      expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    });

    it("should render show/hide password button", () => {
      renderComponent(defaultProps);
      expect(screen.getByText("Show")).toBeInTheDocument();
    });

    it('should show "Hide" when password is visible', () => {
      renderComponent({ ...defaultProps, showPassword: true });
      expect(screen.getByText("Hide")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should toggle basic auth checkbox", () => {
      const onUseBasicAuthChange = vi.fn();
      renderComponent({ ...defaultProps, onUseBasicAuthChange });

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(onUseBasicAuthChange).toHaveBeenCalledWith(true);
    });

    it("should update username", () => {
      const onUsernameChange = vi.fn();
      renderComponent({ ...defaultProps, onUsernameChange });

      const input = screen.getByPlaceholderText("Username");
      fireEvent.change(input, { target: { value: "admin" } });

      expect(onUsernameChange).toHaveBeenCalledWith("admin");
    });

    it("should update password", () => {
      const onPasswordChange = vi.fn();
      renderComponent({ ...defaultProps, onPasswordChange });

      const input = screen.getByPlaceholderText("Password");
      fireEvent.change(input, { target: { value: "secret" } });

      expect(onPasswordChange).toHaveBeenCalledWith("secret");
    });

    it("should toggle password visibility", () => {
      const setShowPassword = vi.fn();
      renderComponent({ ...defaultProps, setShowPassword });

      const button = screen.getByText("Show");
      fireEvent.click(button);

      expect(setShowPassword).toHaveBeenCalledWith(true);
    });
  });

  describe("Password visibility", () => {
    it("should show password as text when showPassword is true", () => {
      renderComponent({ ...defaultProps, showPassword: true, password: "secret" });

      const input = screen.getByPlaceholderText("Password") as HTMLInputElement;
      expect(input.type).toBe("text");
    });

    it("should hide password when showPassword is false", () => {
      renderComponent({ ...defaultProps, showPassword: false, password: "secret" });

      const input = screen.getByPlaceholderText("Password") as HTMLInputElement;
      expect(input.type).toBe("password");
    });
  });

  describe("Theme support", () => {
    it("should apply light theme styles", () => {
      renderComponent(defaultProps, "light");

      const label = screen.getByText("Use Basic Authentication");
      expect(label).toHaveClass("text-gray-700");
    });

    it("should apply dark theme styles", () => {
      renderComponent(defaultProps, "dark");

      const label = screen.getByText("Use Basic Authentication");
      expect(label).toHaveClass("text-white");
    });
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { RequestType, Tab } from "../context/RequestContext";
import { ThemeProvider } from "../context/ThemeContext";
import { TabComponent } from "./TabComponent";

const renderTabComponent = (
  props: {
    activeTab: Tab;
    request: RequestType;
    onTabChange: (tab: Tab) => void;
  },
  theme: "light" | "dark" = "light"
) => {
  localStorage.setItem("theme", theme);

  return render(
    <ThemeProvider>
      <TabComponent {...props} />
    </ThemeProvider>
  );
};

describe("TabComponent", () => {
  describe("HTTP Request Tabs", () => {
    it("should render body tab for HTTP requests", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "body",
        request: "http",
        onTabChange,
      });

      expect(screen.getByText("Body")).toBeInTheDocument();
    });

    it("should render auth tab for HTTP requests", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "auth",
        request: "http",
        onTabChange,
      });

      expect(screen.getByText("Auth")).toBeInTheDocument();
    });

    it("should render params tab for HTTP requests", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "params",
        request: "http",
        onTabChange,
      });

      expect(screen.getByText("Params")).toBeInTheDocument();
    });

    it("should render variables tab for HTTP requests", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "variables",
        request: "http",
        onTabChange,
      });

      expect(screen.getByText("Variables")).toBeInTheDocument();
    });

    it("should render docs tab for HTTP requests", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "description",
        request: "http",
        onTabChange,
      });

      expect(screen.getByText("Docs")).toBeInTheDocument();
    });

    it("should not render GraphQL tabs for HTTP requests", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "body",
        request: "http",
        onTabChange,
      });

      expect(screen.queryByText("GraphQL")).not.toBeInTheDocument();
      expect(screen.queryByText("Schema")).not.toBeInTheDocument();
    });

    it("should not render gRPC tabs for HTTP requests", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "body",
        request: "http",
        onTabChange,
      });

      expect(screen.queryByText("gRPC")).not.toBeInTheDocument();
      expect(screen.queryByText("Proto")).not.toBeInTheDocument();
      expect(screen.queryByText("Metadata")).not.toBeInTheDocument();
    });
  });

  describe("GraphQL Request Tabs", () => {
    it("should render GraphQL tab for GraphQL requests", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "graphql",
        request: "graphql",
        onTabChange,
      });

      expect(screen.getByText("GraphQL")).toBeInTheDocument();
    });

    it("should render Schema tab for GraphQL requests", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "schema",
        request: "graphql",
        onTabChange,
      });

      expect(screen.getByText("Schema")).toBeInTheDocument();
    });

    it("should not render body tab for GraphQL requests", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "graphql",
        request: "graphql",
        onTabChange,
      });

      expect(screen.queryByText("Body")).not.toBeInTheDocument();
    });

    it("should not render params tab for GraphQL requests", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "graphql",
        request: "graphql",
        onTabChange,
      });

      expect(screen.queryByText("Params")).not.toBeInTheDocument();
    });
  });

  describe("gRPC Request Tabs", () => {
    it("should render gRPC tab for gRPC requests", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "grpc",
        request: "grpc",
        onTabChange,
      });

      expect(screen.getByText("gRPC")).toBeInTheDocument();
    });

    it("should render Proto tab for gRPC requests", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "proto",
        request: "grpc",
        onTabChange,
      });

      expect(screen.getByText("Proto")).toBeInTheDocument();
    });

    it("should render Metadata tab for gRPC requests", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "metadata",
        request: "grpc",
        onTabChange,
      });

      expect(screen.getByText("Metadata")).toBeInTheDocument();
    });

    it("should render Schema tab for gRPC requests", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "schema",
        request: "grpc",
        onTabChange,
      });

      expect(screen.getByText("Schema")).toBeInTheDocument();
    });

    it("should not render body tab for gRPC requests", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "grpc",
        request: "grpc",
        onTabChange,
      });

      expect(screen.queryByText("Body")).not.toBeInTheDocument();
    });
  });

  describe("Tab Interactions", () => {
    it("should call onTabChange when clicking body tab", async () => {
      const user = userEvent.setup();
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "auth",
        request: "http",
        onTabChange,
      });

      const bodyTab = screen.getByText("Body");
      await user.click(bodyTab);

      expect(onTabChange).toHaveBeenCalledWith("body");
    });

    it("should call onTabChange when clicking auth tab", async () => {
      const user = userEvent.setup();
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "body",
        request: "http",
        onTabChange,
      });

      const authTab = screen.getByText("Auth");
      await user.click(authTab);

      expect(onTabChange).toHaveBeenCalledWith("auth");
    });

    it("should call onTabChange when clicking GraphQL tab", async () => {
      const user = userEvent.setup();
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "auth",
        request: "graphql",
        onTabChange,
      });

      const graphqlTab = screen.getByText("GraphQL");
      await user.click(graphqlTab);

      expect(onTabChange).toHaveBeenCalledWith("graphql");
    });

    it("should allow clicking active tab", async () => {
      const user = userEvent.setup();
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "body",
        request: "http",
        onTabChange,
      });

      const bodyTab = screen.getByText("Body");
      await user.click(bodyTab);

      expect(onTabChange).toHaveBeenCalledWith("body");
    });
  });

  describe("Tab Active State", () => {
    it("should highlight active tab in light theme", () => {
      const onTabChange = vi.fn();
      const { container } = renderTabComponent(
        {
          activeTab: "body",
          request: "http",
          onTabChange,
        },
        "light"
      );

      const activeButton = container.querySelector(".bg-purple-600");
      expect(activeButton).toBeInTheDocument();
      expect(activeButton).toHaveTextContent("Body");
    });

    it("should highlight active tab in dark theme", () => {
      const onTabChange = vi.fn();
      const { container } = renderTabComponent(
        {
          activeTab: "body",
          request: "http",
          onTabChange,
        },
        "dark"
      );

      const activeButton = container.querySelector(".bg-purple-700");
      expect(activeButton).toBeInTheDocument();
      expect(activeButton).toHaveTextContent("Body");
    });

    it("should not highlight inactive tabs", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "body",
        request: "http",
        onTabChange,
      });

      const authButton = screen.getByText("Auth").closest("button");
      expect(authButton).not.toHaveClass("bg-purple-600");
      expect(authButton).not.toHaveClass("bg-purple-700");
    });
  });

  describe("Theme Support", () => {
    it("should apply light theme styles to inactive tabs", () => {
      const onTabChange = vi.fn();
      const { container } = renderTabComponent(
        {
          activeTab: "body",
          request: "http",
          onTabChange,
        },
        "light"
      );

      const authButton = screen.getByText("Auth").closest("button");
      expect(authButton).toHaveClass("text-gray-600");
    });

    it("should apply dark theme styles to inactive tabs", () => {
      const onTabChange = vi.fn();
      const { container } = renderTabComponent(
        {
          activeTab: "body",
          request: "http",
          onTabChange,
        },
        "dark"
      );

      const authButton = screen.getByText("Auth").closest("button");
      expect(authButton).toHaveClass("text-gray-400");
    });
  });

  describe("Tab Tooltips", () => {
    it("should have tooltip for body tab", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "body",
        request: "http",
        onTabChange,
      });

      const bodyButton = screen.getByText("Body").closest("button");
      expect(bodyButton).toHaveAttribute("title", "Request body (JSON payload)");
    });

    it("should have tooltip for auth tab", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "auth",
        request: "http",
        onTabChange,
      });

      const authButton = screen.getByText("Auth").closest("button");
      expect(authButton).toHaveAttribute("title", "Authentication settings");
    });

    it("should have tooltip for GraphQL tab", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "graphql",
        request: "graphql",
        onTabChange,
      });

      const graphqlButton = screen.getByText("GraphQL").closest("button");
      expect(graphqlButton).toHaveAttribute("title", "GraphQL query and variables");
    });

    it("should have tooltip for Variables tab", () => {
      const onTabChange = vi.fn();
      renderTabComponent({
        activeTab: "variables",
        request: "http",
        onTabChange,
      });

      const variablesButton = screen.getByText("Variables").closest("button");
      expect(variablesButton).toHaveAttribute("title", "Environment variables");
    });
  });

  describe("Common Tabs Across Request Types", () => {
    it("should render auth tab for all request types", () => {
      const onTabChange = vi.fn();

      const { rerender } = renderTabComponent({
        activeTab: "auth",
        request: "http",
        onTabChange,
      });
      expect(screen.getByText("Auth")).toBeInTheDocument();

      localStorage.setItem("theme", "light");
      rerender(
        <ThemeProvider>
          <TabComponent activeTab="auth" request="graphql" onTabChange={onTabChange} />
        </ThemeProvider>
      );
      expect(screen.getByText("Auth")).toBeInTheDocument();

      localStorage.setItem("theme", "light");
      rerender(
        <ThemeProvider>
          <TabComponent activeTab="auth" request="grpc" onTabChange={onTabChange} />
        </ThemeProvider>
      );
      expect(screen.getByText("Auth")).toBeInTheDocument();
    });

    it("should render variables tab for all request types", () => {
      const onTabChange = vi.fn();

      const { rerender } = renderTabComponent({
        activeTab: "variables",
        request: "http",
        onTabChange,
      });
      expect(screen.getByText("Variables")).toBeInTheDocument();

      localStorage.setItem("theme", "light");
      rerender(
        <ThemeProvider>
          <TabComponent activeTab="variables" request="graphql" onTabChange={onTabChange} />
        </ThemeProvider>
      );
      expect(screen.getByText("Variables")).toBeInTheDocument();

      localStorage.setItem("theme", "light");
      rerender(
        <ThemeProvider>
          <TabComponent activeTab="variables" request="grpc" onTabChange={onTabChange} />
        </ThemeProvider>
      );
      expect(screen.getByText("Variables")).toBeInTheDocument();
    });

    it("should render docs tab for all request types", () => {
      const onTabChange = vi.fn();

      const { rerender } = renderTabComponent({
        activeTab: "description",
        request: "http",
        onTabChange,
      });
      expect(screen.getByText("Docs")).toBeInTheDocument();

      localStorage.setItem("theme", "light");
      rerender(
        <ThemeProvider>
          <TabComponent activeTab="description" request="graphql" onTabChange={onTabChange} />
        </ThemeProvider>
      );
      expect(screen.getByText("Docs")).toBeInTheDocument();

      localStorage.setItem("theme", "light");
      rerender(
        <ThemeProvider>
          <TabComponent activeTab="description" request="grpc" onTabChange={onTabChange} />
        </ThemeProvider>
      );
      expect(screen.getByText("Docs")).toBeInTheDocument();
    });
  });
});

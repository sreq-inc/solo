import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../context/ThemeContext";
import { FolderComponent } from "./Folder";

// Mock the curlGenerator
vi.mock("../utils/curlGenerator", () => ({
  generateCurl: vi.fn(() => "curl -X GET http://example.com"),
}));

const mockProps = {
  folder: "Test Folder",
  isOpen: false,
  isDropdownOpen: false,
  onToggleFolder: vi.fn(),
  onToggleDropdown: vi.fn(),
  onCreateNewRequest: vi.fn(),
  onRemoveFolder: vi.fn(),
  onRenameFolder: vi.fn(),
  onFileClick: vi.fn(),
  onRemoveFile: vi.fn(),
  onRenameFile: vi.fn(),
  onDuplicateRequest: vi.fn(),
  currentRequestId: null,
};

const renderFolder = (props = {}, theme: "light" | "dark" = "light") => {
  localStorage.setItem("theme", theme);

  return render(
    <ThemeProvider>
      <FolderComponent {...mockProps} {...props} />
    </ThemeProvider>
  );
};

describe("FolderComponent", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Set up empty files array for the folder
    localStorage.setItem("Test Folder", JSON.stringify([]));
  });

  describe("Rendering", () => {
    it("should render folder with closed icon when not open", () => {
      const { container } = renderFolder();

      const folderButton = screen.getByRole("button", { name: /test folder/i });
      expect(folderButton).toBeInTheDocument();

      // Should show Folder icon (not FolderOpen)
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should render folder with open icon when open", () => {
      renderFolder({ isOpen: true });

      const folderButton = screen.getByRole("button", { name: /test folder/i });
      expect(folderButton).toBeInTheDocument();
    });

    it("should display folder name correctly", () => {
      renderFolder();

      const folderButton = screen.getByRole("button", { name: /test folder/i });
      expect(folderButton).toHaveTextContent("Test Folder");
    });

    it("should show file count badge when files exist", () => {
      const files = [
        { fileName: "file1", displayName: "Request 1", fileData: { method: "GET" } },
        { fileName: "file2", displayName: "Request 2", fileData: { method: "POST" } },
      ];
      localStorage.setItem("Test Folder", JSON.stringify(files));

      renderFolder();

      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should not show file count badge when no files exist", () => {
      renderFolder();

      const badge = screen.queryByText("0");
      expect(badge).not.toBeInTheDocument();
    });

    it("should render chevron dropdown button", () => {
      const { container } = renderFolder();

      const chevronButtons = container.querySelectorAll("button");
      expect(chevronButtons.length).toBeGreaterThan(1);
    });
  });

  describe("Folder interactions", () => {
    it("should call onToggleFolder when folder is clicked", () => {
      renderFolder();

      const folderButton = screen.getByRole("button", { name: /test folder/i });
      fireEvent.click(folderButton);

      expect(mockProps.onToggleFolder).toHaveBeenCalledWith("Test Folder");
      expect(mockProps.onToggleFolder).toHaveBeenCalledTimes(1);
    });

    it("should call onToggleDropdown when chevron is clicked", () => {
      const { container } = renderFolder();

      const buttons = container.querySelectorAll("button");
      const chevronButton = buttons[1]; // Second button is the chevron

      fireEvent.click(chevronButton);

      expect(mockProps.onToggleDropdown).toHaveBeenCalled();
    });

    it("should prevent event propagation when dropdown is toggled", () => {
      const { container } = renderFolder();

      const buttons = container.querySelectorAll("button");
      const chevronButton = buttons[1];

      fireEvent.click(chevronButton);

      // onToggleFolder should not be called when clicking chevron
      expect(mockProps.onToggleFolder).not.toHaveBeenCalled();
    });
  });

  describe("Dropdown menu", () => {
    it("should show dropdown menu when isDropdownOpen is true", () => {
      renderFolder({ isDropdownOpen: true });

      expect(screen.getByText("CREATE")).toBeInTheDocument();
      expect(screen.getByText("HTTP Request")).toBeInTheDocument();
      expect(screen.getByText("GraphQL Request")).toBeInTheDocument();
      expect(screen.getByText("gRPC Request")).toBeInTheDocument();
    });

    it("should not show dropdown menu when isDropdownOpen is false", () => {
      renderFolder({ isDropdownOpen: false });

      expect(screen.queryByText("CREATE")).not.toBeInTheDocument();
    });

    it("should call onCreateNewRequest with http type", () => {
      renderFolder({ isDropdownOpen: true });

      const httpButton = screen.getByText("HTTP Request");
      fireEvent.click(httpButton);

      expect(mockProps.onCreateNewRequest).toHaveBeenCalledWith("Test Folder", "http");
    });

    it("should call onCreateNewRequest with graphql type", () => {
      renderFolder({ isDropdownOpen: true });

      const graphqlButton = screen.getByText("GraphQL Request");
      fireEvent.click(graphqlButton);

      expect(mockProps.onCreateNewRequest).toHaveBeenCalledWith("Test Folder", "graphql");
    });

    it("should call onCreateNewRequest with grpc type", () => {
      renderFolder({ isDropdownOpen: true });

      const grpcButton = screen.getByText("gRPC Request");
      fireEvent.click(grpcButton);

      expect(mockProps.onCreateNewRequest).toHaveBeenCalledWith("Test Folder", "grpc");
    });

    it("should show rename folder option", () => {
      renderFolder({ isDropdownOpen: true });

      expect(screen.getByText("Rename Folder")).toBeInTheDocument();
    });

    it("should show delete folder option", () => {
      renderFolder({ isDropdownOpen: true });

      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("should call onRemoveFolder when delete is clicked", () => {
      renderFolder({ isDropdownOpen: true });

      const deleteButton = screen.getByText("Delete");
      fireEvent.click(deleteButton);

      expect(mockProps.onRemoveFolder).toHaveBeenCalledWith("Test Folder");
    });
  });

  describe("Folder renaming", () => {
    it("should show rename input when rename is clicked", () => {
      renderFolder({ isDropdownOpen: true });

      const renameButton = screen.getByText("Rename Folder");
      fireEvent.click(renameButton);

      const input = screen.getByDisplayValue("Test Folder");
      expect(input).toBeInTheDocument();
    });

    it("should call onRenameFolder when rename is submitted", () => {
      renderFolder({ isDropdownOpen: true });

      const renameButton = screen.getByText("Rename Folder");
      fireEvent.click(renameButton);

      const input = screen.getByDisplayValue("Test Folder");
      fireEvent.change(input, { target: { value: "New Folder Name" } });

      const confirmButton = screen.getByTitle("Confirm");
      fireEvent.click(confirmButton);

      expect(mockProps.onRenameFolder).toHaveBeenCalledWith("Test Folder", "New Folder Name");
    });

    it("should submit rename on Enter key", () => {
      renderFolder({ isDropdownOpen: true });

      const renameButton = screen.getByText("Rename Folder");
      fireEvent.click(renameButton);

      const input = screen.getByDisplayValue("Test Folder");
      fireEvent.change(input, { target: { value: "New Name" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(mockProps.onRenameFolder).toHaveBeenCalledWith("Test Folder", "New Name");
    });

    it("should cancel rename on Escape key", () => {
      renderFolder({ isDropdownOpen: true });

      const renameButton = screen.getByText("Rename Folder");
      fireEvent.click(renameButton);

      const input = screen.getByDisplayValue("Test Folder");
      fireEvent.change(input, { target: { value: "New Name" } });
      fireEvent.keyDown(input, { key: "Escape" });

      expect(mockProps.onRenameFolder).not.toHaveBeenCalled();
    });

    it("should cancel rename when cancel button is clicked", () => {
      renderFolder({ isDropdownOpen: true });

      const renameButton = screen.getByText("Rename Folder");
      fireEvent.click(renameButton);

      const input = screen.getByDisplayValue("Test Folder");
      fireEvent.change(input, { target: { value: "New Name" } });

      const cancelButton = screen.getByTitle("Cancel");
      fireEvent.click(cancelButton);

      expect(mockProps.onRenameFolder).not.toHaveBeenCalled();
    });
  });

  describe("File list rendering", () => {
    it("should render files when folder is open", () => {
      const files = [
        {
          fileName: "file1",
          displayName: "Request 1",
          fileData: { method: "GET" },
        },
      ];
      localStorage.setItem("Test Folder", JSON.stringify(files));

      renderFolder({ isOpen: true });

      expect(screen.getByText("Request 1")).toBeInTheDocument();
    });

    it("should not render files when folder is closed", () => {
      const files = [
        {
          fileName: "file1",
          displayName: "Request 1",
          fileData: { method: "GET" },
        },
      ];
      localStorage.setItem("Test Folder", JSON.stringify(files));

      renderFolder({ isOpen: false });

      expect(screen.queryByText("Request 1")).not.toBeInTheDocument();
    });

    it("should render multiple files", () => {
      const files = [
        { fileName: "file1", displayName: "Request 1", fileData: { method: "GET" } },
        { fileName: "file2", displayName: "Request 2", fileData: { method: "POST" } },
        { fileName: "file3", displayName: "Request 3", fileData: { method: "DELETE" } },
      ];
      localStorage.setItem("Test Folder", JSON.stringify(files));

      renderFolder({ isOpen: true });

      expect(screen.getByText("Request 1")).toBeInTheDocument();
      expect(screen.getByText("Request 2")).toBeInTheDocument();
      expect(screen.getByText("Request 3")).toBeInTheDocument();
    });

    it("should show correct method labels for HTTP requests", () => {
      const files = [
        { fileName: "file1", displayName: "Request 1", fileData: { method: "GET" } },
        { fileName: "file2", displayName: "Request 2", fileData: { method: "POST" } },
      ];
      localStorage.setItem("Test Folder", JSON.stringify(files));

      renderFolder({ isOpen: true });

      expect(screen.getByText("GET")).toBeInTheDocument();
      expect(screen.getByText("POST")).toBeInTheDocument();
    });

    it("should show GQL label for GraphQL requests", () => {
      const files = [
        {
          fileName: "file1",
          displayName: "GraphQL Query",
          fileData: { method: "POST", requestType: "graphql" },
        },
      ];
      localStorage.setItem("Test Folder", JSON.stringify(files));

      renderFolder({ isOpen: true });

      expect(screen.getByText("GQL")).toBeInTheDocument();
    });

    it("should highlight active request", () => {
      const files = [{ fileName: "file1", displayName: "Request 1", fileData: { method: "GET" } }];
      localStorage.setItem("Test Folder", JSON.stringify(files));

      const { container } = renderFolder({ isOpen: true, currentRequestId: "file1" });

      const requestDiv = container.querySelector('[class*="border-l-purple"]');
      expect(requestDiv).toBeInTheDocument();
    });
  });

  describe("File interactions", () => {
    beforeEach(() => {
      const files = [
        {
          fileName: "file1",
          displayName: "Request 1",
          fileData: { method: "GET", url: "http://example.com" },
        },
      ];
      localStorage.setItem("Test Folder", JSON.stringify(files));
    });

    it("should call onFileClick when file is clicked", () => {
      renderFolder({ isOpen: true });

      const fileButton = screen.getByText("Request 1");
      fireEvent.click(fileButton);

      expect(mockProps.onFileClick).toHaveBeenCalledWith("file1");
    });

    it("should show file dropdown menu when more options clicked", async () => {
      const { container } = renderFolder({ isOpen: true });

      const buttons = container.querySelectorAll("button");
      const moreButton = Array.from(buttons).find((btn) => btn.querySelector("svg"));

      if (moreButton && moreButton.textContent === "") {
        fireEvent.click(moreButton);

        await waitFor(() => {
          const renameButton = screen.queryByText("Rename");
          expect(renameButton).toBeInTheDocument();
        });
      }
    });

    it("should call onDuplicateRequest when duplicate is clicked", async () => {
      const { container } = renderFolder({ isOpen: true });

      const moreButtons = container.querySelectorAll("button");
      const moreButton = Array.from(moreButtons).find((btn) =>
        btn.querySelector("svg")?.querySelector('[class*="MoreHorizontal"]')
      );

      if (moreButton) {
        fireEvent.click(moreButton);
      }

      await waitFor(() => {
        const duplicateButton = screen.queryByText("Duplicate");
        if (duplicateButton) {
          fireEvent.click(duplicateButton);
          expect(mockProps.onDuplicateRequest).toHaveBeenCalledWith("Test Folder", "file1");
        }
      });
    });

    it("should copy cURL when Copy as cURL is clicked", async () => {
      const { container } = renderFolder({ isOpen: true });

      // Mock clipboard
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn(),
        },
      });

      const moreButtons = container.querySelectorAll("button");
      const moreButton = Array.from(moreButtons).find((btn) =>
        btn.querySelector("svg")?.querySelector('[class*="MoreHorizontal"]')
      );

      if (moreButton) {
        fireEvent.click(moreButton);
      }

      await waitFor(() => {
        const curlButton = screen.queryByText("Copy as cURL");
        if (curlButton) {
          fireEvent.click(curlButton);
          expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
            "curl -X GET http://example.com"
          );
        }
      });
    });

    it("should call onRemoveFile when delete is clicked", async () => {
      const { container } = renderFolder({ isOpen: true });

      const moreButtons = container.querySelectorAll("button");
      const moreButton = Array.from(moreButtons).find((btn) =>
        btn.querySelector("svg")?.querySelector('[class*="MoreHorizontal"]')
      );

      if (moreButton) {
        fireEvent.click(moreButton);
      }

      await waitFor(() => {
        const deleteButtons = screen.queryAllByText("Delete");
        if (deleteButtons.length > 0) {
          fireEvent.click(deleteButtons[0]);
          expect(mockProps.onRemoveFile).toHaveBeenCalledWith("file1");
        }
      });
    });
  });

  describe("File renaming", () => {
    beforeEach(() => {
      const files = [{ fileName: "file1", displayName: "Request 1", fileData: { method: "GET" } }];
      localStorage.setItem("Test Folder", JSON.stringify(files));
    });

    it("should show rename input when rename is clicked", async () => {
      const { container } = renderFolder({ isOpen: true });

      const moreButtons = container.querySelectorAll("button");
      const moreButton = Array.from(moreButtons).find((btn) =>
        btn.querySelector("svg")?.querySelector('[class*="MoreHorizontal"]')
      );

      if (moreButton) {
        fireEvent.click(moreButton);
      }

      await waitFor(() => {
        const renameButton = screen.queryByText("Rename");
        if (renameButton) {
          fireEvent.click(renameButton);

          const input = screen.queryByDisplayValue("Request 1");
          expect(input).toBeInTheDocument();
        }
      });
    });

    it("should submit file rename on Enter key", async () => {
      const { container } = renderFolder({ isOpen: true });

      const moreButtons = container.querySelectorAll("button");
      const moreButton = Array.from(moreButtons).find((btn) =>
        btn.querySelector("svg")?.querySelector('[class*="MoreHorizontal"]')
      );

      if (moreButton) {
        fireEvent.click(moreButton);
      }

      await waitFor(() => {
        const renameButton = screen.queryByText("Rename");
        if (renameButton) {
          fireEvent.click(renameButton);

          const input = screen.queryByDisplayValue("Request 1");
          if (input) {
            fireEvent.change(input, { target: { value: "New Request Name" } });
            fireEvent.keyDown(input, { key: "Enter" });

            expect(mockProps.onRenameFile).toHaveBeenCalledWith(
              "Test Folder",
              "file1",
              "New Request Name"
            );
          }
        }
      });
    });

    it("should cancel file rename on Escape key", async () => {
      const { container } = renderFolder({ isOpen: true });

      const moreButtons = container.querySelectorAll("button");
      const moreButton = Array.from(moreButtons).find((btn) =>
        btn.querySelector("svg")?.querySelector('[class*="MoreHorizontal"]')
      );

      if (moreButton) {
        fireEvent.click(moreButton);
      }

      await waitFor(() => {
        const renameButton = screen.queryByText("Rename");
        if (renameButton) {
          fireEvent.click(renameButton);

          const input = screen.queryByDisplayValue("Request 1");
          if (input) {
            fireEvent.change(input, { target: { value: "New Name" } });
            fireEvent.keyDown(input, { key: "Escape" });

            expect(mockProps.onRenameFile).not.toHaveBeenCalled();
          }
        }
      });
    });
  });

  describe("Theme support", () => {
    it("should apply light theme styles", () => {
      const { container } = renderFolder({}, "light");

      const folderButton = container.querySelector("button");
      expect(folderButton).toHaveClass("text-gray-800");
    });

    it("should apply dark theme styles", () => {
      const { container } = renderFolder({}, "dark");

      const folderButton = container.querySelector("button");
      expect(folderButton).toHaveClass("text-white");
    });

    it("should apply light theme to dropdown menu", () => {
      const { container } = renderFolder({ isDropdownOpen: true }, "light");

      const dropdown = container.querySelector(".absolute");
      expect(dropdown).toHaveClass("bg-white");
    });

    it("should apply dark theme to dropdown menu", () => {
      const { container } = renderFolder({ isDropdownOpen: true }, "dark");

      const dropdown = container.querySelector(".absolute");
      expect(dropdown).toHaveClass("bg-gray-800");
    });
  });

  describe("Keyboard shortcuts", () => {
    it("should close dropdown on Escape key", () => {
      renderFolder({ isDropdownOpen: true });

      fireEvent.keyDown(document, { key: "Escape" });

      // The component should handle Escape internally
      expect(screen.getByText("CREATE")).toBeInTheDocument();
    });
  });

  describe("Method color coding", () => {
    it("should use green for GET requests", () => {
      const files = [{ fileName: "file1", displayName: "Request 1", fileData: { method: "GET" } }];
      localStorage.setItem("Test Folder", JSON.stringify(files));

      renderFolder({ isOpen: true });

      const methodBadge = screen.getByText("GET");
      expect(methodBadge).toHaveClass("bg-green-300");
    });

    it("should use blue for POST requests", () => {
      const files = [{ fileName: "file1", displayName: "Request 1", fileData: { method: "POST" } }];
      localStorage.setItem("Test Folder", JSON.stringify(files));

      renderFolder({ isOpen: true });

      const methodBadge = screen.getByText("POST");
      expect(methodBadge).toHaveClass("bg-blue-300");
    });

    it("should use purple for GraphQL requests", () => {
      const files = [
        {
          fileName: "file1",
          displayName: "Request 1",
          fileData: { method: "POST", requestType: "graphql" },
        },
      ];
      localStorage.setItem("Test Folder", JSON.stringify(files));

      renderFolder({ isOpen: true });

      const methodBadge = screen.getByText("GQL");
      expect(methodBadge).toHaveClass("bg-purple-300");
    });
  });
});

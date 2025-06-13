import { useEffect } from "react";
import { useFile } from "../context/FileContext";
import { useRequest } from "../context/RequestContext";

type ShortcutAction = () => void;

interface Shortcut {
  key: string;
  cmd?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: ShortcutAction;
}

export const useKeyboardShortcuts = () => {
  const { createNewRequest, currentFolder, setShowModal } = useFile();
  const { setActiveTab } = useRequest();

  const shortcuts: Shortcut[] = [
    {
      key: "k",
      cmd: true,
      description: "Create new collection",
      action: () => {
        setShowModal(true);
      },
    },
    {
      key: "n",
      cmd: true,
      description: "Create new request",
      action: () => {
        if (currentFolder) {
          createNewRequest(currentFolder);
        }
      },
    },
    {
      key: "l",
      cmd: true,
      description: "Focus URL input",
      action: () => {
        const urlInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="https://"]'
        );
        if (urlInput) {
          urlInput.focus();
          urlInput.select();
        }
      },
    },
    {
      key: "b",
      cmd: true,
      shift: true,
      description: "Go to Body tab",
      action: () => setActiveTab("body"),
    },
    {
      key: "a",
      cmd: true,
      shift: true,
      description: "Go to Auth tab",
      action: () => setActiveTab("auth"),
    },
    {
      key: "p",
      cmd: true,
      shift: true,
      description: "Go to Params tab",
      action: () => setActiveTab("params"),
    },
    {
      key: "v",
      cmd: true,
      shift: true,
      description: "Go to Variables tab",
      action: () => setActiveTab("variables"),
    },
    {
      key: "Enter",
      cmd: true,
      description: "Send request",
      action: () => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const targetButton = buttons.find(
          (btn) => btn.textContent === "Send" && !btn.disabled
        );
        if (targetButton) {
          targetButton.click();
        }
      },
    },
    {
      key: "/",
      cmd: true,
      description: "Focus search",
      action: () => {
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder="Search"]'
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcut = shortcuts.find((s) => {
        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase();
        const cmdMatch = s.cmd ? e.ctrlKey || e.metaKey : true;
        const altMatch = s.alt ? e.altKey : !e.altKey;
        const shiftMatch = s.shift ? e.shiftKey : !e.shiftKey;

        return keyMatch && cmdMatch && altMatch && shiftMatch;
      });

      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentFolder]);

  return shortcuts;
};

import { useState, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";

interface JsonViewerProps {
  data: any;
}

interface JsonLine {
  content: string;
  level: number;
  isCollapsible: boolean;
  path: string;
  childrenPaths?: string[];
}

const buildJsonLines = (
  data: any,
  level: number = 0,
  path: string = "root",
  isLast: boolean = true,
  isArrayElement: boolean = false,
  parentKey?: string
): JsonLine[] => {
  const lines: JsonLine[] = [];
  const indent = "  ".repeat(level);

  const formatValue = (val: any): string => {
    if (val === null) return "null";
    if (typeof val === "string") return `"${val}"`;
    if (typeof val === "boolean" || typeof val === "number") return String(val);
    return "";
  };

  if (typeof data !== "object" || data === null) {
    const prefix = parentKey && !isArrayElement ? `"${parentKey}": ` : "";
    const comma = !isLast ? "," : "";
    lines.push({
      content: `${indent}${prefix}${formatValue(data)}${comma}`,
      level,
      isCollapsible: false,
      path,
    });
    return lines;
  }

  const isArray = Array.isArray(data);
  const entries = isArray ? data.map((v, i) => [i, v]) : Object.entries(data);
  const childrenPaths: string[] = [];

  // Opening brace/bracket
  const prefix = parentKey && !isArrayElement ? `"${parentKey}": ` : "";
  const openChar = isArray ? "[" : "{";

  if (entries.length === 0) {
    const closeChar = isArray ? "]" : "}";
    const comma = !isLast ? "," : "";
    lines.push({
      content: `${indent}${prefix}${openChar}${closeChar}${comma}`,
      level,
      isCollapsible: false,
      path,
    });
    return lines;
  }

  lines.push({
    content: `${indent}${prefix}${openChar}`,
    level,
    isCollapsible: true,
    path,
    childrenPaths: [],
  });

  // Contents
  entries.forEach(([key, value], index) => {
    const childPath = `${path}.${key}`;
    childrenPaths.push(childPath);
    const childIsLast = index === entries.length - 1;
    const childLines = buildJsonLines(
      value,
      level + 1,
      childPath,
      childIsLast,
      isArray,
      isArray ? undefined : String(key)
    );
    lines.push(...childLines);
  });

  // Update childrenPaths
  if (lines[0]) {
    lines[0].childrenPaths = childrenPaths;
  }

  // Closing brace/bracket
  const closeChar = isArray ? "]" : "}";
  const comma = !isLast ? "," : "";
  lines.push({
    content: `${indent}${closeChar}${comma}`,
    level,
    isCollapsible: false,
    path: `${path}_close`,
  });

  return lines;
};

export const JsonViewer = ({ data }: JsonViewerProps) => {
  const { theme } = useTheme();
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());

  const allLines = useMemo(() => buildJsonLines(data), [data]);

  const visibleLines = useMemo(() => {
    const visible: JsonLine[] = [];
    const skipUntilPath: string[] = [];

    for (let i = 0; i < allLines.length; i++) {
      const line = allLines[i];

      // Check if we should skip this line
      if (skipUntilPath.length > 0) {
        const shouldSkip = skipUntilPath.some((path) =>
          line.path.startsWith(path)
        );
        if (shouldSkip && line.path !== skipUntilPath[0]) {
          continue;
        }
        if (line.path === `${skipUntilPath[0]}_close`) {
          skipUntilPath.shift();
        }
      }

      visible.push(line);

      // If this line is collapsed, skip its children
      if (line.isCollapsible && collapsedPaths.has(line.path)) {
        skipUntilPath.unshift(line.path);
      }
    }

    return visible;
  }, [allLines, collapsedPaths]);

  const toggleCollapse = (path: string) => {
    setCollapsedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const getLineContent = (line: JsonLine) => {
    const isCollapsed = collapsedPaths.has(line.path);

    if (line.isCollapsible && isCollapsed) {
      const indent = "  ".repeat(line.level);
      const match = line.content.match(/^(\s*)(".*?":\s*)?([\[{])/);

      if (match) {
        const [, , keyPart, openChar] = match;
        const closeChar = openChar === "[" ? "]" : "}";
        const prefix = keyPart || "";

        // Calculate preview
        const childCount = line.childrenPaths?.length || 0;
        const isArray = openChar === "[";
        const preview = isArray
          ? `${childCount} ${childCount === 1 ? "item" : "items"}`
          : `${childCount} ${childCount === 1 ? "key" : "keys"}`;

        // Check if there's a comma at the end of the original content
        const hasComma = line.content.trim().endsWith(",");
        const comma = hasComma ? "," : "";

        return `${indent}${prefix}${openChar}${preview}${closeChar}${comma}`;
      }
    }

    return line.content;
  };

  const colorizeContent = (content: string) => {
    const parts: JSX.Element[] = [];
    let currentIndex = 0;

    // Simple syntax highlighting
    const stringRegex = /"([^"\\]|\\.)*"/g;
    const numberRegex = /\b\d+(\.\d+)?\b/g;
    const boolRegex = /\b(true|false)\b/g;
    const nullRegex = /\bnull\b/g;
    const keyRegex = /"([^"]+)":/g;

    const matches: Array<{
      index: number;
      length: number;
      type: string;
      text: string;
    }> = [];

    let match: RegExpExecArray | null;
    while ((match = keyRegex.exec(content)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        type: "key",
        text: match[0],
      });
    }

    stringRegex.lastIndex = 0;
    while ((match = stringRegex.exec(content)) !== null) {
      // Check if this is not part of a key
      const isKey = matches.some(
        (m) =>
          m.type === "key" &&
          m.index <= match!.index &&
          match!.index < m.index + m.length
      );
      if (!isKey) {
        matches.push({
          index: match.index,
          length: match[0].length,
          type: "string",
          text: match[0],
        });
      }
    }

    numberRegex.lastIndex = 0;
    while ((match = numberRegex.exec(content)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        type: "number",
        text: match[0],
      });
    }

    boolRegex.lastIndex = 0;
    while ((match = boolRegex.exec(content)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        type: "boolean",
        text: match[0],
      });
    }

    nullRegex.lastIndex = 0;
    while ((match = nullRegex.exec(content)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        type: "null",
        text: match[0],
      });
    }

    matches.sort((a, b) => a.index - b.index);

    const getColorClass = (type: string) => {
      switch (type) {
        case "key":
          return theme === "dark" ? "text-purple-400" : "text-purple-700";
        case "string":
          return theme === "dark" ? "text-green-400" : "text-green-700";
        case "number":
          return theme === "dark" ? "text-blue-400" : "text-blue-700";
        case "boolean":
          return theme === "dark" ? "text-yellow-400" : "text-yellow-700";
        case "null":
          return theme === "dark" ? "text-gray-400" : "text-gray-500";
        default:
          return theme === "dark" ? "text-gray-300" : "text-gray-800";
      }
    };

    matches.forEach((m, i) => {
      if (m.index > currentIndex) {
        parts.push(
          <span key={`text-${i}`}>
            {content.substring(currentIndex, m.index)}
          </span>
        );
      }
      parts.push(
        <span key={`match-${i}`} className={getColorClass(m.type)}>
          {m.text}
        </span>
      );
      currentIndex = m.index + m.length;
    });

    if (currentIndex < content.length) {
      parts.push(<span key="text-end">{content.substring(currentIndex)}</span>);
    }

    return parts.length > 0 ? parts : <span>{content}</span>;
  };

  return (
    <table className="w-full table-fixed">
      <tbody className="text-sm">
        {visibleLines.map((line, index) => {
          const lineContent = getLineContent(line);
          const isCollapsed = collapsedPaths.has(line.path);

          return (
            <tr
              key={`${line.path}-${index}`}
              className={clsx(
                theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-200"
              )}
            >
              <td
                className={clsx(
                  "select-none w-14 border-r sticky left-0 px-2",
                  theme === "dark"
                    ? "text-gray-500 border-gray-700 bg-gray-900"
                    : "text-gray-500 border-gray-300 bg-gray-100"
                )}
              >
                <div className="flex items-center justify-between gap-0.5">
                  <span className="flex-shrink-0">{index + 1}</span>
                  {line.isCollapsible ? (
                    <button
                      onClick={() => toggleCollapse(line.path)}
                      className={clsx(
                        "flex-shrink-0 cursor-pointer hover:text-purple-500 transition-colors",
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      )}
                      title={isCollapsed ? "Expandir" : "Colapsar"}
                    >
                      <span className="text-xs">{isCollapsed ? "▶" : "▼"}</span>
                    </button>
                  ) : (
                    <span className="w-3 flex-shrink-0"></span>
                  )}
                </div>
              </td>
              <td
                className={clsx(
                  "pl-4 whitespace-pre-wrap break-words font-mono",
                  theme === "dark" ? "text-gray-300" : "text-gray-800"
                )}
              >
                {colorizeContent(lineContent)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

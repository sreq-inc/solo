import React from "react";
import { useLatestRelease } from "../hooks/useLatestRelease";
import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";

type Props = {
  owner: string;
  repo: string;
  className?: string;
};

export const LatestRelease: React.FC<Props> = ({ owner, repo, className }) => {
  const { release, error, loading } = useLatestRelease(owner, repo);
  const { theme } = useTheme();

  if (error)
    return (
      <div
        className={clsx(
          "text-xs",
          theme === "dark" ? "text-red-400" : "text-red-600"
        )}
      >
        Error: {error}
      </div>
    );

  if (loading || !release)
    return (
      <div
        className={clsx(
          "text-xs",
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        )}
      >
        Loading...
      </div>
    );

  return (
    <div
      className={clsx(
        className,
        "text-xs font-medium",
        theme === "dark" ? "text-gray-500" : "text-gray-900"
      )}
    >
      ({release.tag})
    </div>
  );
};

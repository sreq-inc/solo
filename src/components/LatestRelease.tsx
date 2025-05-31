import React, { useEffect, useState } from "react";

type Release = {
  tag: string;
};

type Props = {
  owner: string;
  repo: string;
  className?: string;
};

export const LatestRelease: React.FC<Props> = ({ owner, repo, className }) => {
  const [release, setRelease] = useState<Release | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
          {
            headers: {
              Accept: "application/vnd.github+json",
              "User-Agent": "latest-release-component",
            },
          },
        );

        if (!res.ok) {
          throw new Error(`Erro ao buscar release: ${res.status}`);
        }

        const data = await res.json();
        setRelease({
          tag: data.tag_name,
        });
      } catch (err: any) {
        setError(err.message || "Erro desconhecido");
      }
    };

    fetchLatestRelease();
  }, [owner, repo]);

  if (error) return <div>Erro: {error}</div>;
  if (!release) return <div>Carregando...</div>;

  return <div className={className}>({release.tag})</div>;
};

import { useEffect, useState } from "react";

type Release = {
  tag: string;
};

export function useLatestRelease(owner: string, repo: string) {
  const [release, setRelease] = useState<Release | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
          }
        );

        if (!res.ok) {
          throw new Error(`Erro ao buscar release: ${res.status}`);
        }

        const data = await res.json();
        setRelease({ tag: data.tag_name });
      } catch (err: any) {
        setError(err.message || "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestRelease();
  }, [owner, repo]);

  return { release, error, loading };
}

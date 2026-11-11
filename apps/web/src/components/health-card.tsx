'use client';

import { useEffect, useState } from 'react';

type Health = {
  status: string;
  database: string;
  timestamp: string;
  uptime?: number;
};

export function HealthCard() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch('/api/health', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as Health;
        if (!cancelled) {
          setHealth(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unknown error');
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-1 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-ink-muted"
      >
        <strong className="text-base font-semibold text-danger">API unreachable</strong>
        <span>{error}. Is the API running on port 3001?</span>
      </div>
    );
  }

  if (!health) {
    return (
      <div
        role="status"
        className="flex flex-col gap-1 rounded-lg border border-line bg-canvas px-4 py-3 text-sm text-ink-muted"
      >
        <strong className="text-base font-semibold text-ink">Checking API…</strong>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="flex flex-col gap-1 rounded-lg border border-brand/30 bg-brand-soft px-4 py-3 text-sm text-brand-ink"
    >
      <strong className="text-base font-semibold text-brand-ink">API {health.status}</strong>
      <span>
        Database {health.database} · {new Date(health.timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
}

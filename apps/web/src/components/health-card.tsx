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
      <div className="status status-error">
        <strong>API unreachable</strong>
        <span>{error}. Is the API running on port 3001?</span>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="status">
        <strong>Checking API…</strong>
      </div>
    );
  }

  return (
    <div className="status status-ok">
      <strong>API {health.status}</strong>
      <span>
        Database {health.database} · {new Date(health.timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
}

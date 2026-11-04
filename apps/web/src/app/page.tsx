import { HealthCard } from '@/components/health-card';

export default function HomePage() {
  return (
    <main className="page">
      <div className="card">
        <p className="eyebrow">Environment setup</p>
        <h1>Music &amp; Education Center</h1>
        <p className="lede">
          The workspace, database schema and API are wired. This page checks the
          browser-to-web-to-API path through the Next.js rewrite.
        </p>

        <HealthCard />

        <ul className="links">
          <li>
            <a href="https://github.com/majdm777/Music-Education-Center/tree/main/Docs">
              Documentation
            </a>
          </li>
          <li>
            <a href="/api/health">Raw API health response</a>
          </li>
        </ul>
      </div>
    </main>
  );
}

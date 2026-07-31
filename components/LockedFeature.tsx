import { PromoSlot } from './PromoSlot';

// A locked tab is an honest placeholder, not a dead end. It tells you three
// things: what this screen does in the managed version, what you'd build
// here yourself (with the guide section that teaches it), and where the
// managed version lives. The repo is yours — every one of these screens is
// buildable.

const GUIDE_URL = 'https://www.appbuilders.us/guides/automated-blog-system';

interface LockedCopy {
  title: string;
  managed: string[];
  diy: string;
  guideRef: string;
}

const COPY: Record<string, LockedCopy> = {
  analytics: {
    title: 'Analytics',
    managed: [
      'Search Console + Google Analytics connected in one click',
      'Your own queries become scored topic ideas automatically',
      'Opportunities: pages that rank but underperform, with fix suggestions',
      'Keyword ground truth: real volume and difficulty on every idea',
      'Per-post traffic, engagement, and attributed conversions',
    ],
    diy: 'The analytics_search_console and content_metrics tables are already migrated and match the guide schema. Build the two nightly pulls and your dashboards here.',
    guideRef: 'Move 5 of the guide gives you the mechanics: which APIs, which columns, the domain-property gotcha, and the rewrite trigger.',
  },
  activity: {
    title: 'Activity',
    managed: [
      'Hand open-ended tasks to an agent running on the blog itself',
      'Every change audited: what was asked, what was done, one-click revert',
      'Full revision history with restore for every draft and post',
      'A findings memory: the system keeps what it learns and reuses it',
    ],
    diy: 'The content_revisions table already snapshots every overwrite. Build a history browser and restore action here; an agent audit log is the next step up.',
    guideRef: 'The guide covers snapshot-before-overwrite in Move 4 and the findings-memory concept in Move 5.',
  },
  configuration: {
    title: 'Configuration',
    managed: [
      'Edit strategy, voice, and prompts from the dashboard or from your agent',
      'Every config change versioned with history and restore',
      'Publishing targets: native blog, WordPress, or any API',
      'Connector registry with live status for every integration',
    ],
    diy: 'In this repo, configuration is files: strategy/STRATEGY.md, strategy/READER.md, the skills. Edit them in git; that IS the config system. Build a file editor here if you want one.',
    guideRef: 'The guide\'s positioning-file section explains what belongs in the strategy files and why the agent reads them on every run.',
  },
  settings: {
    title: 'Settings',
    managed: [
      'API keys stored encrypted, entered once in the dashboard',
      'Per-stage model selection with cost guidance',
      'Review gate, cadence, and quality-gate thresholds as settings',
      'Change anything without a deploy',
    ],
    diy: 'In this repo, settings are .env: keys, models, cadence. That is deliberate. Build a settings store with encrypted secrets here if you outgrow env vars.',
    guideRef: 'See .env.example for every knob this scaffold reads.',
  },
};

export function LockedFeature({ feature }: { feature: keyof typeof COPY }) {
  const copy = COPY[feature];
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{copy.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          This tab is a placeholder in the open-source scaffold. The repo is yours; this screen is
          buildable.
        </p>
      </div>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="font-medium text-sm mb-2">Build it yourself</h2>
        <p className="text-sm text-gray-600">{copy.diy}</p>
        <p className="text-sm text-gray-600 mt-2">
          {copy.guideRef}{' '}
          <a href={GUIDE_URL} className="underline" target="_blank" rel="noopener">
            Read the guide
          </a>
        </p>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="font-medium text-sm mb-2">In the managed version</h2>
        <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
          {copy.managed.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <PromoSlot placement={`${feature}-tab`} />
    </div>
  );
}

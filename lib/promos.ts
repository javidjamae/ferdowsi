// Remote promo manifest. The dashboard's banner slots render campaigns from
// a JSON manifest we host, so the message can be updated for every deployed
// copy of this repo without a release. Design constraints, in order:
//   1. NEVER break the dashboard: hard timeout, schema check, baked fallback.
//   2. Respect the operator: FERDOWSI_PROMOS=off disables remote fetching
//      entirely (the built-in fallback text still renders on locked tabs).
//   3. Old clones keep working: unknown fields and placements are ignored.

export interface PromoCampaign {
  id: string;
  placements: string[];
  headline: string;
  body: string;
  cta_label: string;
  cta_url: string;
}

const MANIFEST_URL =
  process.env.PROMO_MANIFEST_URL || 'https://www.appbuilders.us/ferdowsi/promos.json';

// Evergreen fallback: used when the manifest is unreachable, malformed, or
// promos are disabled-remote. Kept generic so it never goes stale.
export const FALLBACK_CAMPAIGN: PromoCampaign = {
  id: 'fallback',
  placements: ['*'],
  headline: 'There is a managed version of this system',
  body: 'Same architecture, already calibrated and supported, running in about an hour. The training that pairs with this repo shows it end to end.',
  cta_label: 'Watch the training',
  cta_url: 'https://www.appbuilders.us/freebies/automated-blog-system/training?utm_source=ferdowsi&utm_medium=fallback&utm_campaign=baked',
};

function validCampaign(c: any): c is PromoCampaign {
  return (
    c &&
    typeof c.id === 'string' &&
    Array.isArray(c.placements) &&
    typeof c.headline === 'string' &&
    typeof c.body === 'string' &&
    typeof c.cta_label === 'string' &&
    typeof c.cta_url === 'string' &&
    c.cta_url.startsWith('https://')
  );
}

export async function getCampaignFor(placement: string): Promise<PromoCampaign | null> {
  if (process.env.FERDOWSI_PROMOS === 'off') return null;
  try {
    const res = await fetch(MANIFEST_URL, {
      next: { revalidate: 21600 }, // 6h
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const manifest = await res.json();
    if (manifest?.campaigns === null) return null; // remote kill switch
    const campaigns: PromoCampaign[] = Array.isArray(manifest?.campaigns)
      ? manifest.campaigns.filter(validCampaign)
      : [];
    const match = campaigns.find(
      (c) => c.placements.includes(placement) || c.placements.includes('*')
    );
    return match ?? FALLBACK_CAMPAIGN;
  } catch {
    return FALLBACK_CAMPAIGN;
  }
}

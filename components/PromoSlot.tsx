import { getCampaignFor } from '@/lib/promos';

// One promo banner, remotely controlled. Renders nothing when the manifest's
// kill switch is on. Server component: the fetch (cached 6h) happens at
// render, never in the browser.
export async function PromoSlot({ placement }: { placement: string }) {
  const campaign = await getCampaignFor(placement);
  if (!campaign) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 flex items-start justify-between gap-4">
      <div>
        <div className="font-medium text-sm">{campaign.headline}</div>
        <div className="text-sm text-gray-600 mt-1">{campaign.body}</div>
      </div>
      <a
        href={campaign.cta_url}
        className="shrink-0 text-sm bg-black text-white rounded px-3 py-2"
        target="_blank"
        rel="noopener"
      >
        {campaign.cta_label}
      </a>
    </div>
  );
}

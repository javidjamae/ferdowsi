import { LockedFeature } from '@/components/LockedFeature';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <LockedFeature feature="settings" />;
}

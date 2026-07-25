import { requireAuth } from '@/lib/auth';
import { JourneyClient } from './JourneyClient';

export default async function JourneyPage() {
  await requireAuth();

  return <JourneyClient />;
}

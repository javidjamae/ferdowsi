import { applyRules } from './rules';
import { validateAndRewrite } from './validator';

export type HumanizerLevel = 'light' | 'standard' | 'aggressive';

export async function humanize(
  draft: string,
  level: HumanizerLevel = 'standard'
): Promise<string> {
  const ruled = applyRules(draft);
  if (level === 'light') return ruled;
  return validateAndRewrite(ruled);
}

// Three-axis topic scoring (guide: Move 1). The LLM researcher scores each
// candidate against the rubric in skills/blog-topic-research/SKILL.md and
// returns the breakdown; these helpers turn a breakdown into a queue
// decision. Tune the thresholds for your business.

export interface ScoreBreakdown {
  evidence: number; // 0-4: how proven is the demand
  intent: number;   // 0-3: does the product solve the searcher's problem
  gap: number;      // 0-3: can we beat what's already ranking
}

export function totalScore(b: ScoreBreakdown): number {
  return clamp(b.evidence, 0, 4) + clamp(b.intent, 0, 3) + clamp(b.gap, 0, 3);
}

export function priorityFromScore(score: number): number {
  if (score >= 8) return 1; // write next
  if (score >= 6) return 2; // soon
  return 3;                 // backlog
}

/** Below this total, a candidate never enters the queue (anti-filler floor). */
export const SCORE_FLOOR = 5;

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number(n) || 0));
}

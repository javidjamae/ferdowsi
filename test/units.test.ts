import { describe, it, expect } from 'vitest';
import { totalScore, priorityFromScore, SCORE_FLOOR } from '../lib/topic-scoring';
import { applyRules } from '../lib/humanizer/rules';
import { markdownToHtml } from '../lib/markdown';
import { shrinkRatio, MAX_SHRINK } from '../lib/revisions';
import { extractJSON } from '../lib/llm';
import { FALLBACK_CAMPAIGN } from '../lib/promos';

describe('topic scoring', () => {
  it('totals and clamps the three axes', () => {
    expect(totalScore({ evidence: 4, intent: 3, gap: 3 })).toBe(10);
    expect(totalScore({ evidence: 9, intent: -2, gap: 1 })).toBe(5); // clamped
    expect(totalScore({ evidence: NaN as any, intent: 2, gap: 2 })).toBe(4);
  });
  it('maps score to priority bands', () => {
    expect(priorityFromScore(9)).toBe(1);
    expect(priorityFromScore(6)).toBe(2);
    expect(priorityFromScore(SCORE_FLOOR)).toBe(3);
  });
});

describe('humanizer rules', () => {
  it('strips AI tells deterministically', () => {
    const out = applyRules(
      "In today's fast-paced world, let's dive in — it's worth noting that you should utilize FFmpeg."
    );
    expect(out).not.toMatch(/today's fast-paced world/i);
    expect(out).not.toMatch(/dive in/i);
    expect(out).not.toMatch(/worth noting/i);
    expect(out).not.toContain('—');
    expect(out).toMatch(/use FFmpeg/);
  });
});

describe('markdown renderer', () => {
  it('renders headings, code fences, lists, and inline marks', () => {
    const html = markdownToHtml(
      '# Title\n\nSome **bold** and `code`.\n\n- one\n- two\n\n```js\nconst x = 1 < 2;\n```'
    );
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<code>code</code>');
    expect(html).toContain('<li>one</li>');
    expect(html).toContain('language-js');
    expect(html).toContain('1 &lt; 2'); // escaped inside fence
  });
  it('escapes raw HTML instead of executing it', () => {
    expect(markdownToHtml('<script>alert(1)</script>')).not.toContain('<script>');
  });
  it('survives an unclosed fence without eating content', () => {
    expect(markdownToHtml('```\nunclosed')).toContain('unclosed');
  });
});

describe('revision shrink guard', () => {
  it('flags a truncated save and passes a normal edit', () => {
    const original = 'x'.repeat(1000);
    expect(shrinkRatio(original, 'x'.repeat(100))).toBeGreaterThan(MAX_SHRINK);
    expect(shrinkRatio(original, 'x'.repeat(900))).toBeLessThan(MAX_SHRINK);
  });
});

describe('LLM JSON extraction', () => {
  it('parses fenced, bare, and prose-wrapped JSON', () => {
    expect(extractJSON('```json\n[{"a":1}]\n```')).toEqual([{ a: 1 }]);
    expect(extractJSON('Here you go: [{"a":1}] hope that helps')).toEqual([{ a: 1 }]);
    expect(extractJSON('no json here')).toBeNull();
  });
});

describe('promo fallback', () => {
  it('is evergreen and https-only', () => {
    expect(FALLBACK_CAMPAIGN.cta_url).toMatch(/^https:\/\//);
    expect(FALLBACK_CAMPAIGN.placements).toContain('*');
  });
});

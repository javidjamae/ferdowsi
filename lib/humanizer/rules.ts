interface Rule {
  pattern: RegExp;
  replacement: string;
}

const PUNCTUATION_RULES: Rule[] = [
  { pattern: / — /g, replacement: '. ' },
  { pattern: /—/g, replacement: '-' },
  { pattern: /[‘’]/g, replacement: "'" },
  { pattern: /[“”]/g, replacement: '"' },
];

const FILLER_PHRASE_RULES: Rule[] = [
  { pattern: /in today's (fast-paced |rapidly evolving )?world,?\s*/gi, replacement: '' },
  { pattern: /in the world of [^,.]+,?\s*/gi, replacement: '' },
  { pattern: /let's dive in[.,]?\s*/gi, replacement: '' },
  { pattern: /buckle up[.,]?\s*/gi, replacement: '' },
  { pattern: /imagine this[.:]?\s*/gi, replacement: '' },
  { pattern: /picture this[.:]?\s*/gi, replacement: '' },
  { pattern: /when it comes to /gi, replacement: 'for ' },
  { pattern: /at the end of the day,?\s*/gi, replacement: '' },
];

const HEDGING_RULES: Rule[] = [
  { pattern: /it's worth noting that /gi, replacement: '' },
  { pattern: /interestingly,?\s*/gi, replacement: '' },
  { pattern: /essentially,?\s*/gi, replacement: '' },
  { pattern: /basically,?\s*/gi, replacement: '' },
  { pattern: /in essence,?\s*/gi, replacement: '' },
  { pattern: /notably,?\s*/gi, replacement: '' },
];

const CORPORATE_FILLER_RULES: Rule[] = [
  { pattern: /\butilize\b/gi, replacement: 'use' },
  { pattern: /\bleverage\b/gi, replacement: 'use' },
  { pattern: /\bin order to\b/gi, replacement: 'to' },
  { pattern: /\bat this point in time\b/gi, replacement: 'now' },
  { pattern: /\bdue to the fact that\b/gi, replacement: 'because' },
];

const STRUCTURE_RULES: Rule[] = [
  { pattern: /not just (\w+), but (also )?(\w+)/gi, replacement: '$1. And $3.' },
];

const ALL_RULES: Rule[] = [
  ...PUNCTUATION_RULES,
  ...FILLER_PHRASE_RULES,
  ...HEDGING_RULES,
  ...CORPORATE_FILLER_RULES,
  ...STRUCTURE_RULES,
];

export function applyRules(text: string): string {
  return ALL_RULES.reduce(
    (acc, rule) => acc.replace(rule.pattern, rule.replacement),
    text
  );
}

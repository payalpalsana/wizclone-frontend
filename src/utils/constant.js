export const SENSITIVITY_OPTIONS = [
  { key: 'strict', label: 'Strict', threshold: '>90% confidence', description: 'Exact or near-exact matches only' },
  { key: 'balanced', label: 'Balanced', threshold: '>75%', description: 'Recommended for most teams', recommended: true },
  { key: 'loose', label: 'Loose', threshold: '>55%', description: 'Match even loosely related items' },
]
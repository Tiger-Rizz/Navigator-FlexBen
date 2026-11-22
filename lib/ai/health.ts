/** Spots health information in a message, so the privacy note is shown by code, not left to the model. */
const CONDITIONS = ['asthma', 'diabetes', 'cancer', 'depression', 'anxiety', 'pregnant', 'pregnancy', 'arthritis', 'condition', 'illness', 'surgery', 'injury', 'therapy', 'mental health', 'flare'];

export function healthMentions(text: string): string[] {
  const t = text.toLowerCase();
  return CONDITIONS.filter((c) => t.includes(c));
}

/** Mentions that matter for scenario choice (§8): currently Sam's asthma. */
export function scenarioMentions(text: string): string[] {
  return /asthma/i.test(text) ? ['asthma'] : [];
}

/** Personal health disclosures (not generic "what would surgery cost" questions). */
export function isHealthDisclosure(text: string): boolean {
  return /(asthma|diabetes|cancer|depression|anxiety|pregnan|arthritis|\bcondition|illness|diagnos)/i.test(text);
}

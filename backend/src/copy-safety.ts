// This MVP has category evidence, but no independently verified exact-product
// fact/offer feed. Publishable specifications cannot be inferred from that evidence.
export function copyTemplate(problem: string) {
  if (/model|generation/i.test(problem)) return { exampleCopy: '[Exact product model] — explore the features. Learn more.', proposedChange: 'Identify the exact product model and link to its confirmed specifications.' };
  if (/price|pricing|cost|value|afford/i.test(problem)) return { exampleCopy: '[Exact product model] — [verified local price]. [Confirmed offer terms].', proposedChange: 'Display the verified local price and any confirmed offer terms alongside the purchase link.' };
  if (/cancellation|\bANC\b|performance|claim/i.test(problem)) return { exampleCopy: '[Verified product benefit]. See the supporting test and its conditions: [source].', proposedChange: 'Support the advertised benefit with a relevant test for the exact model. Include figures or endorsements only after verification.' };
  if (/call.to.action|\bCTA\b/i.test(problem)) return { exampleCopy: 'Explore [exact product model]. Learn more.', proposedChange: 'Add a clear next step such as Learn more or Shop now, linked to the exact product.' };
  return { exampleCopy: '[Exact product model] — [verified benefit or specification]. Learn more.', proposedChange: 'Add the confirmed product information needed to address this concern; leave unknown details as placeholders until verified.' };
}

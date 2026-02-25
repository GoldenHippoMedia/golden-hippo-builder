export const SUBSCRIPTION_FREQUENCIES = [
  'Daily',
  'Weekly',
  'Monthly',
  'EveryFourtyFiveDays',
  'BiMonthly',
  'Quarterly',
  'Triannual',
  'EveryFiveMonths',
  'SemiAnnual',
  'Annual',
] as const;

export type SubscriptionFrequency = (typeof SUBSCRIPTION_FREQUENCIES)[number];

/** Approximate number of days for each subscription frequency */
const FREQUENCY_DAYS: Record<SubscriptionFrequency, number> = {
  Daily: 1,
  Weekly: 7,
  Monthly: 30,
  EveryFourtyFiveDays: 45,
  BiMonthly: 60,
  Quarterly: 90,
  Triannual: 122, // 3× per year ≈ 365/3
  EveryFiveMonths: 150,
  SemiAnnual: 182,
  Annual: 365,
};

/** Display labels for each frequency option */
export const FREQUENCY_LABELS: Record<SubscriptionFrequency, string> = {
  Daily: 'Daily',
  Weekly: 'Weekly',
  Monthly: 'Monthly',
  EveryFourtyFiveDays: 'Every 45 Days',
  BiMonthly: 'Bi-Monthly (60 days)',
  Quarterly: 'Quarterly (90 days)',
  Triannual: 'Triannual (3×/year)',
  EveryFiveMonths: 'Every 5 Months',
  SemiAnnual: 'Semi-Annual (6 months)',
  Annual: 'Annual',
};

/**
 * Calculates the closest subscription frequency based on a product's per-unit usage days and quantity.
 *
 * @param usageDaysPerUnit - How many days a single unit of the product lasts
 * @param quantity - Number of units in the purchase
 * @returns The SubscriptionFrequency whose cadence most closely matches `usageDaysPerUnit * quantity`
 *
 * @example
 * calculateSubscriptionFrequency(30, 1) // 'Monthly'
 * calculateSubscriptionFrequency(30, 2) // 'BiMonthly'
 * calculateSubscriptionFrequency(30, 3) // 'Quarterly'
 * calculateSubscriptionFrequency(30, 6) // 'SemiAnnual'
 */
export function calculateSubscriptionFrequency(usageDaysPerUnit: number, quantity: number): SubscriptionFrequency {
  const totalDays = usageDaysPerUnit * quantity;
  let closest: SubscriptionFrequency = 'Monthly';
  let closestDiff = Infinity;
  for (const [freq, days] of Object.entries(FREQUENCY_DAYS)) {
    const diff = Math.abs(days - totalDays);
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = freq as SubscriptionFrequency;
    }
  }
  return closest;
}

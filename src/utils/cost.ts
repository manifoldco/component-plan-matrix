import { pluralize } from './text';

export const ONE_BILLION = 10 ** 9;
export const TEN_MILLION = 10 ** 7;
export const ONE_MILLION = 10 ** 6;
export const ONE_HUNDRED_THOUSAND = 10 ** 5;

const SECONDS_IN_HOURS = 60 * 60;

export function normalizeNaN(maybeNaN: number, fallback = 0) {
  return Number.isNaN(maybeNaN) ? fallback : maybeNaN;
}

export function toUSD(cents: number) {
  return new Intl.NumberFormat('en-us', { style: 'currency', currency: 'USD' })
    .format(cents / 100)
    .replace(/.00$/, '');
}

export function centsToMicroCost(cents: string) {
  const cost = normalizeNaN(parseFloat(cents), 0);
  return Math.round(cost * TEN_MILLION);
}

export function dollarsToMicroCost(dollars: string) {
  const cost = normalizeNaN(parseFloat(dollars), 0);
  return Math.round(cost * ONE_BILLION);
}

export function microCostToDollars(microCost: number) {
  return microCost / ONE_BILLION;
}

export function microCostToCents(microCost: number) {
  return microCost / TEN_MILLION;
}

export function displayTierCost(microCost: number, unit: string): string {
  let multiplier = 1;
  if (microCost === 0) {
    return 'Free'; // if this is free, show ”free”
  }

  // if ziggeo
  if (unit.toLowerCase().startsWith('second')) {
    return `${toUSD((microCost * SECONDS_IN_HOURS) / TEN_MILLION)} / hour`;
  }

  // otherwise, multiply by some generic amount
  if (microCost >= ONE_BILLION) {
    return `${toUSD(microCostToCents(microCost))} / ${unit}`; // if the cost is already >= $1, don’t bother multiplying
  }
  if (microCost < ONE_HUNDRED_THOUSAND) {
    multiplier = Math.ceil(ONE_MILLION / microCost / 10000) * 10000; // increment by 10k
  } else if (microCost < ONE_MILLION) {
    multiplier = Math.ceil(TEN_MILLION / microCost / 1000) * 1000; // increment by 1k
  }

  const singularOrPlural =
    multiplier > 1
      ? `${new Intl.NumberFormat('en-US', {
          notation: 'compact',
        } as Intl.NumberFormatOptions).format(multiplier)} ${pluralize(unit)}`
      : unit;

  return `${toUSD((multiplier * microCost) / TEN_MILLION)} / ${singularOrPlural.toLowerCase()}`;
}

export function displayLimit(limit: number, unit: string): string {
  // infinite
  if (limit === -1) {
    return '∞';
  }

  // ziggeo
  if (unit.toLowerCase().startsWith('second')) {
    return `${Math.round(limit / SECONDS_IN_HOURS)}`;
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
  } as Intl.NumberFormatOptions).format(limit);
}

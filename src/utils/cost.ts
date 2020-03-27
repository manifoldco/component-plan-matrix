import { singularize, pluralize } from './text';

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

  const singularUnit = singularize(unit); // remove trailing “s”

  // if ziggeo
  if (unit.toLowerCase().startsWith('second')) {
    return `${toUSD((microCost * SECONDS_IN_HOURS) / TEN_MILLION)} / hour`;
  }

  // otherwise, multiply by some generic amount
  if (microCost >= ONE_BILLION) {
    return `${toUSD(microCostToCents(microCost))} / ${singularUnit}`; // if the cost is already >= $1, don’t bother multiplying
  }
  // increase multiplier until we can represent full precision of cost in whole cents
  while (
    Math.floor((microCost * multiplier) / TEN_MILLION) !==
    (microCost * multiplier) / TEN_MILLION
  ) {
    multiplier *= 10;
  }

  const singularOrPlural =
    multiplier > 1
      ? `${new Intl.NumberFormat('en-US', {
          notation: 'compact',
        } as Intl.NumberFormatOptions).format(multiplier)} ${pluralize(singularUnit)}`
      : singularUnit;

  return `${toUSD((multiplier * microCost) / TEN_MILLION)} / ${singularOrPlural.toLowerCase()}`;
}

export function displayRange(lower: number, upper: number, unit: string): string {
  const isZiggeo = unit.toLowerCase().startsWith('second');

  const format = (n: number, addOne?: boolean) => {
    const adjustment = n > 0 && addOne ? 1 : 0; // add one, say, if lower bound

    // ziggeo
    if (isZiggeo) {
      return `${Math.round(n / SECONDS_IN_HOURS) + adjustment}`;
    }

    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
    } as Intl.NumberFormatOptions).format(n + adjustment);
  };

  // only one tier
  if (lower === 0 && upper === -1) {
    return '';
  }

  const singularUnit = isZiggeo ? 'hour' : singularize(unit.toLocaleLowerCase());

  // if upper tier infinite
  if (upper === -1) {
    return `${format(lower, true)}+ ${pluralize(singularUnit)}`;
  }

  // default (add one to lower if > 0)
  return `${format(lower, true)} – ${format(upper)} ${pluralize(singularUnit)}`;
}

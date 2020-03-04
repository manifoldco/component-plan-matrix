import { Gateway } from '../types/gateway';
import { RestFetch } from './restFetch';
import { PlanFeatureType, PlanConfigurableFeatureEdge } from '../types/graphql';

interface PlanCostOptions {
  planID: string;
  features: Gateway.FeatureMap;
  init: RequestInit;
}

export const NUMBER_FEATURE_COIN = 10000000; // Numeric features are a ten-millionth of a cent, because floats stink

/**
 * Convert number feature costs to float cents (NOT DOLLARS)
 */
export function featureCost(number: number) {
  return number / NUMBER_FEATURE_COIN;
}

/**
 * For really, really, really cheap features that would normally display something awful like
 * “$0.000002345 / unit”, this figures out a sane number to display something like “$0.02 per 4,000 units”.
 */
export function oneCent(number: number) {
  const min = Math.ceil(NUMBER_FEATURE_COIN / number);
  // If sorta tiny round to nearest thousand
  if (min < 1000) {
    return Math.ceil(min / 1000) * 1000;
  }
  // Otherwise, round to nearest hundred
  return Math.ceil(min / 100) * 100;
}

/**
 * Fetch cost from our API
 */
export function planCost(restFetch: RestFetch, { planID, features, init }: PlanCostOptions) {
  return restFetch<Gateway.Price>({
    service: 'gateway',
    endpoint: `/id/plan/${planID}/cost`,
    body: { features },
    options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      ...init,
    },
  });
}

/**
 * Get default feature map for configurableFeatures
 */
export function configurableFeatureDefaults(configurableFeatures: PlanConfigurableFeatureEdge[]) {
  const defaultFeatures: Gateway.FeatureMap = {};

  configurableFeatures.forEach(({ node: { label, numericDetails, featureOptions, type } }) => {
    switch (type) {
      case PlanFeatureType.Boolean: {
        defaultFeatures[label] = false;
        break;
      }
      case PlanFeatureType.Number:
        defaultFeatures[label] = numericDetails?.min;
        break;
      case PlanFeatureType.String:
        defaultFeatures[label] = featureOptions?.[0].value;
        break;
      default:
        defaultFeatures[label] = undefined;
        break;
    }
  });

  return defaultFeatures;
}

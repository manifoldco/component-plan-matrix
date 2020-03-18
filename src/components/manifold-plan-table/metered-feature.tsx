import { FunctionalComponent, h } from '@stencil/core';
import { displayLimit, displayTierCost } from '../../utils/cost';
import { ProductQuery } from '../../types/graphql';

type ProductPlan = ProductQuery['product']['plans']['edges'][0]['node'];
type PlanMeteredFeature = ProductPlan['meteredFeatures']['edges'][0]['node'];

interface MeteredFeatureProps {
  feature: PlanMeteredFeature;
}

const MeteredFeature: FunctionalComponent<MeteredFeatureProps> = ({ feature }) => {
  const { numericDetails } = feature;
  if (!numericDetails.costTiers || numericDetails.costTiers.length === 0) {
    return (
      <div class="mp--cell mp--cell__body">
        <span class="mp--empty-cell">•</span>
      </div>
    );
  }

  const { costTiers = [], unit } = numericDetails;

  return (
    <div class="mp--cell mp--cell__body mp--cell__block">
      <div class="mp--metered">
        <div class="mp--metered__header">
          <p class="mp--metered__header-text">cost</p>
          <p class="mp--metered__header-text mp--metered__header-tar">usage range</p>
        </div>
        {costTiers.map(({ limit, cost }, i) => {
          const inDollars = cost && unit && displayTierCost(cost, unit);
          const previous = numericDetails.costTiers[i - 1];
          const min = previous?.limit ? previous.limit : 0;
          return (
            <div class="mp--metered__cost-tiers">
              <p class="mp--metered__cost-tiers__text">{inDollars === 0 ? 'Free' : inDollars}</p>
              <p class="mp--metered__cost-tiers__text mp--metered__cost-tiers__last">
                {min > 0 && unit && `${displayLimit(min, unit)} –`}
                {limit && unit && displayLimit(limit, unit)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MeteredFeature;

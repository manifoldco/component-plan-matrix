import { FunctionalComponent, h } from '@stencil/core';
import { displayRange, displayTierCost } from '../../utils/cost';
import { singularize } from '../../utils/text';
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
  const multitiered = costTiers.length > 1;

  return (
    <div class="mp--cell mp--cell__body mp--cell__block">
      <div class="mp--metered">
        <div class="mp--metered__header">
          <p class="mp--metered__header-text">billed per {singularize(unit)}</p>
        </div>
        <div class="mp--metered__cost-tiers" data-multitiered={multitiered || undefined}>
          {multitiered ? (
            costTiers.map(({ limit: tierUpper, cost }, i) => {
              let tierLower = 0;
              if (i > 0) {
                tierLower = numericDetails.costTiers[i - 1].limit + 1;
              }
              return [
                <div class="mp--metered__cost-tiers__range">
                  {displayRange(tierLower, tierUpper, unit)}
                </div>,
                <div class="mp--metered__cost-tiers__cost">
                  {!cost ? 'Free' : displayTierCost(cost, unit)}
                </div>,
              ];
            })
          ) : (
            <div class="mp--metered__cost-tiers__cost">
              {!costTiers[0].cost ? 'Free' : displayTierCost(costTiers[0].cost, unit)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeteredFeature;

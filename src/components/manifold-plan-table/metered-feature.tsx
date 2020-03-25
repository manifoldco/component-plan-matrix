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
      <div class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Body">
        <span class="ManifoldPlanTable__Cell__Disabled">•</span>
      </div>
    );
  }

  const { costTiers = [], unit } = numericDetails;
  const multitiered = costTiers.length > 1;

  return (
    <div class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Body ManifoldPlanTable__Cell--Block">
      <div class="ManifoldPlanTable__Metered">
        <div class="ManifoldPlanTable__Metered__Header">
          <div class="ManifoldPlanTable__Metered__HeaderText">billed per {singularize(unit)}</div>
        </div>
        <div
          class="ManifoldPlanTable__Metered__CostTiers"
          data-multitiered={multitiered || undefined}
        >
          {multitiered ? (
            costTiers.map(({ limit: tierUpper, cost }, i) => {
              let tierLower = 0;
              if (i > 0) {
                tierLower = numericDetails.costTiers[i - 1].limit + 1;
              }

              return [
                <div class="ManifoldPlanTable__Metered__CostTiers__Range">
                  {displayRange(tierLower, tierUpper, unit)}
                </div>,
                <div class="ManifoldPlanTable__Metered__CostTiers__Cost">
                  {!cost ? 'Free' : displayTierCost(cost, unit)}
                </div>,
              ];
            })
          ) : (
            <div class="ManifoldPlanTable__Metered__CostTiers__Cost">
              {!costTiers[0].cost ? 'Free' : displayTierCost(costTiers[0].cost, unit)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeteredFeature;

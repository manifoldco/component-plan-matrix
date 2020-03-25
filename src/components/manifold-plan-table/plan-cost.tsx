import { FunctionalComponent, h } from '@stencil/core';
import { toUSD } from '../../utils/cost';

interface PlanCostProps {
  cost?: number;
  metered?: boolean;
}

const PlanCost: FunctionalComponent<PlanCostProps> = ({ cost, metered }) => {
  if (cost === 0 && !metered) {
    return <span>Free</span>;
  }

  if (cost !== undefined) {
    return (
      <span>
        {toUSD(cost)}
        <small class="ManifoldPlanSelector__Plan__Subtext">/mo</small>
        {metered && <div class="ManifoldPlanSelector__Plan__Subtext">+ metered use</div>}
      </span>
    );
  }

  return (
    <div class="ManifoldPlanSelector__Loading">
      <div class="ManifoldPlanSelector__Loading__Dot" style={{ animationDelay: '0' }}></div>
      <div class="ManifoldPlanSelector__Loading__Dot" style={{ animationDelay: '250ms' }}></div>
      <div class="ManifoldPlanSelector__Loading__Dot" style={{ animationDelay: '500ms' }}></div>
    </div>
  );
};

export default PlanCost;

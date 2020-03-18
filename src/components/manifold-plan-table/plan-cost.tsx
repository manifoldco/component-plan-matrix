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
        <small class="mp--plan-subtext">/mo</small>
        {metered && <div class="mp--plan-subtext">+ metered use</div>}
      </span>
    );
  }

  return (
    <div class="mp--loading">
      <div class="mp--loading__dot" style={{ animationDelay: '0' }}></div>
      <div class="mp--loading__dot" style={{ animationDelay: '250ms' }}></div>
      <div class="mp--loading__dot" style={{ animationDelay: '500ms' }}></div>
    </div>
  );
};

export default PlanCost;

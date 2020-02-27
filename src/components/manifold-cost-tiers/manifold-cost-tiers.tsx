import { Component, Prop, h } from '@stencil/core';
import { displayLimit, displayTierCost } from '../../utils/cost';

@Component({
  tag: 'manifold-cost-tiers',
  styleUrl: 'manifold-cost-tiers.css',
})
export class ManifoldCostTiers {
  @Prop() minLimit?: number = 0;
  @Prop() maxLimit?: number = 0;
  @Prop() cost?: number = 0;
  @Prop() unit?: string = '';

  render() {
    const cost = this.cost && this.unit && displayTierCost(this.cost, this.unit);
    return (
      <div class="mp--cost-tiers">
        <p class="mp--cost-tiers__text">{cost === 0 ? 'free' : cost}</p>
        <p class="mp--cost-tiers__text mp--cost-tiers__last">
          {this.minLimit && this.unit && displayLimit(this.minLimit, this.unit)} –{' '}
          {this.maxLimit && this.unit && displayLimit(this.maxLimit, this.unit)}
        </p>
      </div>
    );
  }
}

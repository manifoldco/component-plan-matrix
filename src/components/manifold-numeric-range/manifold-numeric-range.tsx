import { Component, Prop, h } from '@stencil/core';
import { displayLimit, displayTierCost, toUSD } from '../../utils/cost';

@Component({
  tag: 'manifold-numeric-range',
  styleUrl: 'manifold-numeric-range.css',
})
export class ManifoldNumericRange {
  @Prop() minLimit?: number = 0;
  @Prop() maxLimit?: number = 0;
  @Prop() cost?: number = 0;
  @Prop() unit?: string = '';

  render() {
    const cost = this.cost && this.unit && displayTierCost(this.cost, this.unit);
    return (
      <div class="mp--numeric-range">
        <p class="mp--numeric-range__text">{cost === 0 ? toUSD(cost) : cost}</p>
        <p class="mp--numeric-range__text mp--numeric-range__last">
          {this.minLimit && this.unit && displayLimit(this.minLimit, this.unit)} -{' '}
          {this.maxLimit && this.unit && displayLimit(this.maxLimit, this.unit)}
        </p>
      </div>
    );
  }
}

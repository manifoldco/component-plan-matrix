import { Component, Prop, h } from '@stencil/core';
import { ProductQuery } from '../../types/graphql';

@Component({
  tag: 'manifold-thead',
  styleUrl: 'manifold-thead.css',
})
export class ManifoldThead {
  @Prop() titleText?: string = '';
  @Prop() plan?: ProductQuery['product']['plans']['edges'][0];

  render() {
    if (!this.plan) {
      return this.titleText;
    }

    return [
      this.titleText,
      <p class="mp--plan-cost">
        ${this.plan.node.cost / 100}
        <span class="mp--subtext">/mo</span>
      </p>,
      this.plan.node.meteredFeatures.edges.length > 0 && (
        <span class="mp--subtext"> + metered use</span>
      ),
    ];
  }
}

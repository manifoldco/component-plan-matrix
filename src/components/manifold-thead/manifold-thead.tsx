import { Component, Prop, h } from '@stencil/core';
import { PlanEdge } from 'types/graphql';

@Component({
  tag: 'manifold-thead',
  styleUrl: 'manifold-thead.css',
})
export class ManifoldThead {
  @Prop() titleText: string;
  @Prop() plan?: PlanEdge;

  render() {
    if (!this.plan) {
      return this.titleText;
    }

    return [
      this.titleText,
      <p class="mp--plan-cost">
        ${this.plan.node.cost}
        <span class="mp--subtext">/mo</span>
      </p>,
      this.plan.node.meteredFeatures && <span class="mp--subtext"> + metered use</span>,
    ];
  }
}

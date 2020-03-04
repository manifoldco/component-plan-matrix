import { Component, Prop, State, h } from '@stencil/core';
import { ProductQuery, PlanConfigurableFeatureEdge } from '../../types/graphql';
import { toUSD } from '../../utils/cost';
import { planCost, configurableFeatureDefaults } from '../../utils/plan';
import { createRestFetch } from '../../utils/restFetch';
import { connections } from '../../utils/connections';

@Component({
  tag: 'manifold-thead',
  styleUrl: 'manifold-thead.css',
})
export class ManifoldThead {
  @Prop() titleText?: string = '';
  @Prop() plan?: ProductQuery['product']['plans']['edges'][0];
  @State() loading = true;
  @State() controller?: AbortController;
  @State() cost?: { cost: number; currency: string };
  @State() costCalls = 0;
  // TODO add watch to call price updates on UI updates.

  restFetch = createRestFetch({
    endpoints: () => connections.prod,
  });

  componentWillLoad() {
    if (this.plan && this.plan?.node?.configurableFeatures?.edges.length > 0) {
      this.fetchCustomPrice();
    }
  }

  fetchCustomPrice() {
    if (this.controller) {
      this.controller.abort();
    } // If a request is in flight, cancel it
    this.controller = new AbortController();

    if (this.plan && this.plan?.node?.configurableFeatures?.edges.length > 0) {
      const features = this.plan?.node?.configurableFeatures?.edges;
      // planId get cost
      planCost(this.restFetch, {
        planID: this.plan.node.id,
        features: configurableFeatureDefaults(features as PlanConfigurableFeatureEdge[]),
        init: { signal: this.controller.signal },
      }).then(data => {
        this.cost = data;
        this.loading = false;
        this.costCalls += 1;
      });
    }
  }

  render() {
    const header = [this.titleText];
    if (!this.plan) {
      return header;
    }

    if (this.plan.node.configurableFeatures.edges.length > 0) {
      if (this.loading) {
        header.push(<p class="mp--subtext">Calculating cost...</p>);
        return header;
      }

      header.push(
        <p class="mp--plan-cost">
          {this.costCalls < 2 && <span class="mp--subtext">Starting at</span>}{' '}
          {this.cost && toUSD(this.cost.cost)}
          <span class="mp--subtext">/mo</span>
        </p>
      );

      return header;
    }

    // Manual cost calc
    header.push(
      <p class="mp--plan-cost">
        {toUSD(this.plan.node.cost)}
        <span class="mp--subtext">/mo</span>
      </p>
    );

    if (this.plan.node.meteredFeatures.edges.length > 0) {
      header.push(<span class="mp--subtext"> + metered use</span>);
    }

    return header;
  }
}

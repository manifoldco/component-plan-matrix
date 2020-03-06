import { Component, h, State, Prop, Watch } from '@stencil/core';
import { chevron_up_down } from '@manifoldco/icons';
import merge from 'deepmerge';
import { ProductQueryVariables, ProductQuery, PlanFeatureType } from '../../types/graphql';
import { toUSD } from '../../utils/cost';
import { defaultFeatureValue, fetchPlanCost } from '../../utils/feature';
import { CLIENT_ID_WARNING } from './warning';
import FixedFeature from './fixed-feature';
import MeteredFeature from './metered-feature';
import PlanCost from './plan-cost';
import SkeletonLoader from './skeleton';
import query from './product.graphql';

// query types
type ProductFixed = ProductQuery['product']['fixedFeatures']['edges'][0]['node'];
type ProductMetered = ProductQuery['product']['meteredFeatures']['edges'][0]['node'];
type ProductConfigurable = ProductQuery['product']['configurableFeatures']['edges'][0]['node'];
interface ProductFeatures {
  fixed: { [label: string]: ProductFixed };
  metered: { [label: string]: ProductMetered };
  configurable: { [label: string]: ProductConfigurable };
}
type ProductPlan = ProductQuery['product']['plans']['edges'][0]['node'];
type PlanFixedFeature = ProductPlan['fixedFeatures']['edges'][0]['node'];
type PlanMeteredFeature = ProductPlan['meteredFeatures']['edges'][0]['node'];
type PlanConfigurableFeature = ProductPlan['configurableFeatures']['edges'][0]['node'];
interface PlanFeatures {
  [planID: string]: {
    [featureLabel: string]:
      | PlanFixedFeature
      | PlanMeteredFeature
      | PlanConfigurableFeature
      | undefined;
  };
}

// state
type UserValue = string | number | boolean;
interface UserSelection {
  [planID: string]: { [featureLabel: string]: UserValue };
}

// settings
const GRAPHQL_ENDPOINT = 'https://api.manifold.co/graphql';
const GATEWAY_ENDPOINT = 'https://api.manifold.co/v1';
const MANIFOLD_CLIENT_ID = 'Manifold-Client-ID';

@Component({
  tag: 'manifold-plan-matrix',
  styleUrl: 'manifold-plan-matrix.css',
})
export class ManifoldPricing {
  // Gateway endpoint (TEMP)
  @Prop() gatewayUrl?: string = GATEWAY_ENDPOINT;
  // GraphQL endpoint (TEMP)
  @Prop() graphqlUrl?: string = GRAPHQL_ENDPOINT;
  // Passed product ID to the graphql endpoint
  @Prop() productId?: string;
  // Passed client ID header to the graphql calls
  @Prop() clientId?: string = '';
  // Base url for buttons
  @Prop() baseUrl?: string = '/signup';
  // CTA Text for buttons
  @Prop() ctaText?: string = 'Get Started';
  // Product data
  @State() product?: ProductQuery['product'];
  // Product features
  @State() productFeatures: ProductFeatures = { fixed: {}, metered: {}, configurable: {} };
  // Plan costs
  @State() planCosts: { [planID: string]: number };
  // Plan features
  @State() planFeatures: PlanFeatures = {};
  // User selection
  @State() userSelection: UserSelection = {};
  @Watch('productId') refetchProduct(newVal?: string) {
    if (newVal) {
      this.fetchProduct(newVal);
    }
  }

  componentWillLoad() {
    if (!this.clientId) {
      console.warn(CLIENT_ID_WARNING);
    }
    if (this.productId) {
      // Note: we could warn here if product-id is missing, but let’s not. In some front-end frameworks it may be set a half-second after it loads
      this.fetchProduct(this.productId);
    }
  }

  async fetchProduct(productID: string) {
    const variables: ProductQueryVariables = { id: productID };
    const res = await fetch(this.graphqlUrl || GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Connection: 'keep-alive',
        ...(this.clientId ? { [MANIFOLD_CLIENT_ID]: this.clientId } : {}),
      },
      body: JSON.stringify({ query, variables }),
    }).then(body => body.json());
    const data = res.data as ProductQuery;

    if (!data || !data.product) {
      return;
    }

    // save result to state
    this.product = data.product;

    // create map of all product features in fixed / metered / configurable order
    const fixed = data.product.fixedFeatures.edges.reduce(
      (features, { node }) => ({ ...features, [node.label]: node }),
      {}
    );
    const metered = data.product.meteredFeatures.edges.reduce(
      (features, { node }) => ({ ...features, [node.label]: node }),
      {}
    );
    const configurable = data.product.configurableFeatures.edges.reduce(
      (features, { node }) => ({ ...features, [node.label]: node }),
      {}
    );
    this.productFeatures = { fixed, metered, configurable };

    // create map of plan costs, plan feature values, and default user selection
    const featureLabels = Object.keys({ ...fixed, ...metered, ...configurable });
    const planCosts: { [planID: string]: number } = {};
    const planFeatures: PlanFeatures = {};
    const userSelection: UserSelection = {};

    data.product.plans.edges.forEach(({ node: plan }) => {
      // add cost to map
      planCosts[plan.id] = plan.cost;
      // add features to map
      planFeatures[plan.id] = featureLabels.reduce((labels, label) => {
        const planHasFeature = [
          ...plan.fixedFeatures.edges,
          ...plan.meteredFeatures.edges,
          ...plan.configurableFeatures.edges,
        ].find(({ node: feature }) => feature.label === label);
        return {
          ...labels,
          [label]: planHasFeature ? planHasFeature.node : undefined,
        };
      }, {});
      // add configurable feature defaults
      if (plan.configurableFeatures.edges.length) {
        userSelection[plan.id] = plan.configurableFeatures.edges.reduce(
          (features, { node: feature }) => ({
            ...features,
            [feature.label]: defaultFeatureValue(feature),
          }),
          {}
        );
      }
    });

    this.planFeatures = planFeatures;
    this.planCosts = planCosts;
    this.userSelection = userSelection;

    this.fetchCosts(); // get initial plan costs, if any
  }

  fetchCosts() {
    // this.userSelection should only contain configurable plans
    Object.entries(this.userSelection).forEach(([planID, selection]) => {
      const oldCost = this.planCosts[planID];

      // animate plan cost calculation, but only if it’s taking a while (prevents flickering)
      let flickerStopper: any;
      flickerStopper = setTimeout(() => {
        const newCosts = merge(this.planCosts, {});
        delete newCosts[planID];
        this.planCosts = newCosts;
        flickerStopper = undefined;
      }, 150);

      // fetch plan cost for this configurable plan
      fetchPlanCost({ planID, selection, url: GATEWAY_ENDPOINT }).then(cost => {
        if (typeof cost === 'number') {
          clearTimeout(flickerStopper);
          this.planCosts = merge(this.planCosts, { [planID]: cost });
        } else {
          console.error('Error retrieving cost');
          this.planCosts = merge(this.planCosts, { [planID]: oldCost });
        }
      });
    });
  }

  setFeature({
    planID,
    featureLabel,
    featureValue,
  }: {
    planID: string;
    featureLabel: string;
    featureValue: UserValue;
  }) {
    this.userSelection = merge(this.userSelection, { [planID]: { [featureLabel]: featureValue } });
    this.fetchCosts();
  }

  displayConfigurable({ planID, feature }: { planID: string; feature: PlanConfigurableFeature }) {
    switch (feature.type) {
      case PlanFeatureType.String: {
        return (
          <div class="mp--cell mp--cell__body">
            <label class="mp--select">
              <select
                class="mp--select__input"
                onChange={e =>
                  this.setFeature({
                    planID,
                    featureLabel: feature.label,
                    featureValue: (e.target as HTMLInputElement).value,
                  })
                }
              >
                {(feature.featureOptions || []).map(option => (
                  <option value={option.value}>
                    <span>{option.displayName}</span>
                    <span> ({toUSD(option.cost)})</span>
                  </option>
                ))}
              </select>
              <svg
                class="mp--select__chevron"
                viewBox="0 0 1024 1024"
                xmlns="http://www.w3.org/2000/svg"
                xmlns-x="http://www.w3.org/1999/xlink"
              >
                <path d={chevron_up_down} />
              </svg>
              <div class="mp--select__border"></div>
            </label>
          </div>
        );
      }
      case PlanFeatureType.Number: {
        const {
          numericDetails: { max, min, increment, unit },
        } = feature;
        const setFeature = (e: Event) =>
          this.setFeature({
            planID,
            featureLabel: feature.label,
            featureValue: (e.target as HTMLInputElement).value,
          });
        return (
          <div class="mp--cell mp--cell__body">
            <label class="mp--numeric-range">
              <input
                class="mp--numeric-range__input"
                inputmode="numeric"
                max={max}
                min={min}
                name="numericRange"
                onChange={setFeature}
                onKeyUp={setFeature}
                pattern="[0-9]*"
                step={increment}
                type="number"
                value={(this.userSelection[planID][feature.label] as number) || min}
              />
              <span class="mp--numeric-range__desc">
                {min} – {max} {unit}
              </span>
            </label>
          </div>
        );
      }
      case PlanFeatureType.Boolean: {
        return (
          <div class="mp--cell mp--cell__body">
            <label class="mp--toggle">
              <input
                class="mp--toggle__input"
                type="checkbox"
                onChange={e => {
                  this.setFeature({
                    planID,
                    featureLabel: feature.label,
                    featureValue: (e.target as HTMLInputElement).checked,
                  });
                }}
                value="on"
              />
              <div class="mp--toggle__toggle"></div>
            </label>
          </div>
        );
      }
      default:
        return null;
    }
  }

  render() {
    // 💀 Skeleton Loader
    if (!this.product) {
      return <SkeletonLoader />;
    }

    const gridColumns = 1 + this.product.plans.edges.length; // + 1 for features column
    const gridRows =
      1 +
      Object.keys({
        ...this.productFeatures.fixed,
        ...this.productFeatures.metered,
        ...this.productFeatures.configurable,
      }).length +
      1; // + 1 for headings + 1 for CTA row

    return (
      <div
        class="mp"
        style={{ '--table-columns': `${gridColumns}`, '--table-rows': `${gridRows}` }}
      >
        <div
          class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__al mp--cell__th mp--cell__thead mp--cell__bts"
          data-column-first
          data-row-first
        ></div>
        {Object.values({
          ...this.productFeatures.fixed,
          ...this.productFeatures.metered,
          ...this.productFeatures.configurable,
        }).map(feature => (
          <div class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__al mp--cell__th">
            {feature.displayName}
          </div>
        ))}
        <div
          class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__bbs mp--cell__al mp--cell__th"
          data-column-first
          data-row-last
        ></div>
        {this.product.plans.edges.map(({ node: plan }, planIndex) => {
          const lastColumn = planIndex === gridColumns - 2 || undefined;

          return [
            <div
              class="mp--cell mp--cell__bts mp--cell__thead mp--cell__thead mp--cell__th"
              data-row-first
              data-column-last={lastColumn}
            >
              {plan.displayName}
              <p class="mp--plan-cost">
                <PlanCost
                  cost={this.planCosts[plan.id]}
                  metered={plan.meteredFeatures.edges.length > 0}
                />
              </p>
            </div>,
            Object.values(this.planFeatures[plan.id]).map(feature => {
              // fixed feature
              if (feature && this.productFeatures.fixed[feature.label]) {
                return <FixedFeature displayValue={(feature as PlanFixedFeature).displayValue} />;
              }

              // metered feature
              if (feature && this.productFeatures.metered[feature.label]) {
                return <MeteredFeature feature={feature as PlanMeteredFeature} />;
              }

              // configurable
              if (feature && this.productFeatures.configurable[feature.label]) {
                const configurableFeature = feature as PlanConfigurableFeature;
                return this.displayConfigurable({ planID: plan.id, feature: configurableFeature });
              }

              // undefined / disabled feature
              return (
                <div class="mp--cell mp--cell__body">
                  <span class="mp--empty-cell">•</span>
                </div>
              );
            }),
            <div
              class="mp--cell mp--cell__body mp--cell__bbs"
              data-row-last
              data-column-last={lastColumn}
            >
              <a class="mp--button" id={`manifold-cta-plan-${plan.id}`} href={this.baseUrl}>
                {this.ctaText}
              </a>
            </div>,
          ];
        })}
      </div>
    );
  }
}

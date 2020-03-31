import { Component, h, State, Prop, Watch, Element } from '@stencil/core';
import { Connection } from '@manifoldco/manifold-init-types/types/v0';
import svgChevronUpDown from '@manifoldco/mercury/icons/chevron-up-down.svg';
import merge from 'deepmerge';

import {
  ProductQueryVariables,
  ProductQuery,
  PlanFeatureType,
  ProductNumberConfigurableFeature,
  ProductBooleanConfigurableFeature,
} from '../../types/graphql';
import { toUSD } from '../../utils/cost';
import { defaultFeatureValue, fetchPlanCost } from '../../utils/feature';
import logger, { loadMark } from '../../utils/logger';

import { CLIENT_ID_WARNING } from './warning';
import FixedFeature from './fixed-feature';
import MeteredFeature from './metered-feature';
import PlanCost from './plan-cost';
import SkeletonLoader from './skeleton';
import query from './product.graphql';

// query types
type ProductFixed = ProductQuery['product']['fixedFeatures']['edges'][0]['node'];
type ProductMetered = ProductQuery['product']['meteredFeatures']['edges'][0]['node'];
type ProductConfigurable = ProductNumberConfigurableFeature & ProductBooleanConfigurableFeature;
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

@Component({ tag: 'manifold-plan-table' })
export class ManifoldPlanTable {
  @Element() el: HTMLElement;
  // Passed product ID to the graphql endpoint
  @Prop() productId?: string;
  // Passed client ID header to the graphql calls
  @Prop() clientId?: string = '';
  // Base url for buttons
  @Prop() baseUrl?: string = '/signup';
  @Prop() gatewayUrl?: string;
  // CTA Text for buttons
  @Prop() ctaText?: string = 'Get Started';
  @Prop() env?: 'stage' | 'local' | 'prod' = 'stage';
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
      this.setupProduct(newVal);
    }
  }

  connection: Connection;

  @loadMark()
  async componentWillLoad() {
    await customElements.whenDefined('manifold-init');
    const core = document.querySelector('manifold-init') as HTMLManifoldInitElement;
    this.connection = await core.initialize({
      element: this.el,
      componentVersion: '<@NPM_PACKAGE_VERSION@>',
      version: 0,
    });
    if (!this.clientId) {
      console.warn(CLIENT_ID_WARNING);
    }
    if (this.productId) {
      // Note: we could warn here if product-id is missing, but let’s not. In some front-end frameworks it may be set a half-second after it loads
      this.setupProduct(this.productId);
    }
  }

  // trying to move fetch out for testing.
  async setupProduct(productID: string) {
    const variables: ProductQueryVariables = { id: productID };
    const res = await this.connection.graphqlFetch<ProductQuery>({ query, variables });
    const { data } = res;

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
    const featureLabels = this.sortedProductFeatures().map((f) => f.label);
    const planCosts: { [planID: string]: number } = {};
    const planFeatures: PlanFeatures = {};
    const userSelection: UserSelection = {};

    // iterate through plans to gather costs, features, and configurable feature defaults
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
      fetchPlanCost(this.connection, {
        planID,
        selection,
      }).then((cost) => {
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

  ctaHref(planID: string) {
    if (!this.baseUrl || this.baseUrl === '#') {
      return this.baseUrl;
    }

    const search = new URLSearchParams();
    // set plan ID
    search.set('planId', planID);

    // set configurable feature selection (or skip, if no configurable features);
    Object.entries(this.userSelection[planID] || {}).forEach(([key, val]) => {
      search.set(key, `${val}`);
    });

    return `${this.baseUrl}?${search.toString()}`;
  }

  handleCtaClick(e: MouseEvent, planId: string, destination = '') {
    e.preventDefault();

    this.connection.analytics
      .track({
        description: 'Track pricing matrix cta clicks',
        name: 'click',
        type: 'component-analytics',
        properties: {
          planId,
        },
      })
      .then(() => {
        window.location.href = destination;
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
          <div class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Body">
            <label class="ManifoldPlanTable__Select">
              <select
                class="ManifoldPlanTable__Select__Input"
                onChange={(e) =>
                  this.setFeature({
                    planID,
                    featureLabel: feature.label,
                    featureValue: (e.target as HTMLInputElement).value,
                  })
                }
              >
                {(feature.featureOptions || []).map((option) => (
                  <option value={option.value}>
                    <span>{option.displayName}</span>
                    <span> ({toUSD(option.cost)})</span>
                  </option>
                ))}
              </select>
              <div class="ManifoldPlanTable__Select__Chevron" innerHTML={svgChevronUpDown} />
              <div class="ManifoldPlanTable__Select__Border"></div>
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
          <div class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Body">
            <label class="ManifoldPlanTable__NumericRange">
              <input
                class="ManifoldPlanTable__NumericRange__Input"
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
              <span class="ManifoldPlanTable__NumericRange__Desc">
                {min} – {max} {unit}
              </span>
            </label>
          </div>
        );
      }
      case PlanFeatureType.Boolean: {
        return (
          <div class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Body">
            <label class="ManifoldPlanTable__Toggle">
              <input
                class="ManifoldPlanTable__Toggle__Input"
                type="checkbox"
                onChange={(e) => {
                  this.setFeature({
                    planID,
                    featureLabel: feature.label,
                    featureValue: (e.target as HTMLInputElement).checked,
                  });
                }}
                value="on"
              />
              <div class="ManifoldPlanTable__Toggle__Toggle"></div>
            </label>
          </div>
        );
      }
      default:
        return null;
    }
  }

  sortedProductFeatures() {
    const toggles = Object.values(this.productFeatures.configurable).filter(
      (f) =>
        f.featureOptions &&
        f.featureOptions.length === 2 &&
        f.featureOptions.filter((o) => o.value === 'true') &&
        f.featureOptions.filter((o) => o.value === 'false')
    );
    const multipleChoice = Object.values(this.productFeatures.configurable)
      .filter((f) => f.featureOptions)
      .filter((f) => !toggles.map((t) => t.label).includes(f.label));
    return [
      ...Object.values(this.productFeatures.metered), // Pay as you go
      ...multipleChoice,
      ...Object.values(this.productFeatures.configurable).filter((f) => f.numericOptions), // Numeric range
      ...Object.values(this.productFeatures.fixed).filter((f) => f.featureOptions.length !== 2), // Text
      ...toggles,
      ...Object.values(this.productFeatures.fixed).filter((f) => f.featureOptions.length === 2), // Checkbox
    ];
  }

  @logger()
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
        class="ManifoldPlanTable"
        style={{ '--table-columns': `${gridColumns}`, '--table-rows': `${gridRows}` }}
      >
        <div
          class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Sticky ManifoldPlanTable__Cell--TH ManifoldPlanTable__Cell--THead"
          data-column-first
          data-row-first
        ></div>
        {this.sortedProductFeatures().map((feature) => (
          <div
            class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Sticky ManifoldPlanTable__Cell--TH"
            data-column-first
          >
            {feature.displayName}
          </div>
        ))}
        <div
          class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Sticky ManifoldPlanTable__Cell--TH"
          data-column-first
          data-row-last
        ></div>
        {this.product.plans.edges.map(({ node: plan }, planIndex) => {
          const lastColumn = planIndex === gridColumns - 2 || undefined;

          return [
            <div
              class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--THead ManifoldPlanTable__Cell--TH"
              data-row-first
              data-column-last={lastColumn}
            >
              {plan.displayName}
              <p class="ManifoldPlanTable__Plan__Cost">
                <PlanCost
                  cost={this.planCosts[plan.id]}
                  metered={plan.meteredFeatures.edges.length > 0}
                />
              </p>
            </div>,
            Object.values(this.planFeatures[plan.id]).map((feature) => {
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
                return this.displayConfigurable({
                  planID: plan.id,
                  feature: configurableFeature,
                });
              }

              // undefined / disabled feature
              return (
                <div class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Body">
                  <span class="ManifoldPlanTable__Cell__Disabled">•</span>
                </div>
              );
            }),
            <div
              class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Body"
              data-row-last
              data-column-last={lastColumn}
            >
              <a
                data-testid="cta"
                class="ManifoldPlanTable__Button"
                id={`manifold-cta-plan-${plan.id}`}
                href={this.ctaHref(plan.id)}
                onClick={(e) => this.handleCtaClick(e, plan.id, this.baseUrl)}
              >
                {this.ctaText}
              </a>
            </div>,
          ];
        })}
      </div>
    );
  }
}

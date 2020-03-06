import { Component, h, State, Prop, Watch } from '@stencil/core';
import { check, chevron_up_down } from '@manifoldco/icons';
import { ProductQueryVariables, ProductQuery, PlanFeatureType } from '../../types/graphql';
import { toUSD } from '../../utils/cost';
import { CLIENT_ID_WARNING } from './warning';
import query from './product.graphql';

const GRAPHQL_ENDPOINT = 'https://api.manifold.co/graphql';
const MANIFOLD_CLIENT_ID = 'Manifold-Client-ID';

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
interface UserSelection {
  [planID: string]: { [featureLabel: string]: string | number | boolean | undefined };
}

// settings
const DEFAULT_PLANS = 3;
const DEFAULT_FEATURES = 5;

@Component({
  tag: 'manifold-plan-matrix',
  styleUrl: 'manifold-plan-matrix.css',
})
export class ManifoldPricing {
  // Passed product ID to the graphql endpoint
  @Prop() productId?: string;
  // Passed client ID header to the graphql calls
  @Prop() clientId?: string = '';
  // Base url for buttons
  @Prop() baseUrl?: string = '/signup';
  // CTA Text for buttons
  @Prop() ctaText?: string = 'Get Started';
  // Graphql enpoint (TEMP)
  @Prop() graphqlUrl?: string = GRAPHQL_ENDPOINT;
  // Product data
  @State() product?: ProductQuery['product'];
  // Product features
  @State() productFeatures: ProductFeatures = { fixed: {}, metered: {}, configurable: {} };
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
    });
    const json = await res.json();
    const data = json.data as ProductQuery;

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

    // create map of plan feature values
    const featureLabels = Object.keys({ ...fixed, ...metered, ...configurable });
    this.planFeatures = data.product.plans.edges.reduce(
      (plans, { node: plan }) => ({
        ...plans,
        [plan.id]: featureLabels.reduce((labels, label) => {
          const planHasFeature = [
            ...plan.fixedFeatures.edges,
            ...plan.meteredFeatures.edges,
            ...plan.configurableFeatures.edges,
          ].find(({ node: feature }) => feature.label === label);
          return {
            ...labels,
            [label]: planHasFeature ? planHasFeature.node : undefined,
          };
        }, {}),
      }),
      {}
    );
  }

  displayFixed(displayValue: string) {
    if (['yes', 'true'].includes(displayValue.toLowerCase())) {
      return (
        <div class="mp--cell mp--cell__body">
          <svg
            class="mp--check"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            xmlns-x="http://www.w3.org/1999/xlink"
          >
            <path d={check} />
          </svg>
        </div>
      );
    }
    if (displayValue.toLowerCase() === 'false') {
      return (
        <div class="mp--cell mp--cell__body">
          <span class="mp--empty-cell">•</span>
        </div>
      );
    }
    return <div class="mp--cell mp--cell__body">{displayValue}</div>;
  }

  displayMetered(feature: PlanMeteredFeature) {
    const { numericDetails } = feature;
    if (!numericDetails.costTiers) {
      return (
        <div class="mp--cell mp--cell__body">
          <span class="mp--empty-cell">•</span>
        </div>
      );
    }

    const { costTiers = [] } = numericDetails;

    if (costTiers.length === 0) {
      return <div class="mp--cell mp--cell__body">Free</div>;
    }

    return (
      <div class="mp--cell mp--cell__body mp--cell__block">
        <div class="mp--metered">
          <div class="mp--metered__header">
            <p class="mp--metered__header-text">cost</p>
            <p class="mp--metered__header-text mp--metered__header-tar">usage range</p>
          </div>
          {costTiers.map(({ limit, cost }, i) => {
            const previous = numericDetails.costTiers[i - 1];
            const min = previous?.limit ? previous.limit : 0;
            return (
              <manifold-cost-tiers
                min-limit={min}
                max-limit={limit}
                cost={cost}
                unit={numericDetails.unit}
              ></manifold-cost-tiers>
            );
          })}
        </div>
      </div>
    );
  }

  displayConfigurable(feature: PlanConfigurableFeature) {
    switch (feature.type) {
      case PlanFeatureType.String:
        return (
          <div class="mp--cell mp--cell__body">
            <div class="mp--select">
              <select class="mp--select__input">
                {(feature.featureOptions || []).map(option => (
                  <option value={option.cost}>
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
            </div>
          </div>
        );
      case PlanFeatureType.Number: {
        const {
          numericDetails: { max, min, increment, unit },
        } = feature;
        return (
          <div class="mp--cell mp--cell__body">
            <label class="mp--numeric-range">
              <input
                class="mp--numeric-range__input"
                inputmode="numeric"
                max={max}
                min={min}
                name="numericRange"
                pattern="[0-9]*"
                step={increment}
                type="number"
                value={min}
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
              <input class="mp--toggle__input" type="checkbox" />
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
    const gridColumns = 1 + ((this.product && this.product.plans.edges.length) || 0); // + 1 for features column
    const gridRows =
      1 +
      Object.keys({
        ...this.productFeatures.fixed,
        ...this.productFeatures.metered,
        ...this.productFeatures.configurable,
      }).length +
      1; // + 1 for headings + 1 for CTA row

    return this.product ? (
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
              <manifold-thead title-text={plan.displayName} plan={plan}></manifold-thead>
            </div>,
            Object.values(this.planFeatures[plan.id]).map(feature => {
              // fixed feature
              if (feature && this.productFeatures.fixed[feature.label]) {
                const fixedFeature = feature as PlanFixedFeature;
                return this.displayFixed(fixedFeature.displayValue);
              }

              // metered feature
              if (feature && this.productFeatures.metered[feature.label]) {
                const meteredFeature = feature as PlanMeteredFeature;
                return this.displayMetered(meteredFeature);
              }

              // configurable
              if (feature && this.productFeatures.configurable[feature.label]) {
                const configurableFeature = feature as PlanConfigurableFeature;
                return this.displayConfigurable(configurableFeature);
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
    ) : (
      // 💀 Skeleton (uses &nbsp; characters to prevent flash of unstyled text)
      <div
        class="mp"
        style={{
          '--table-columns': `${1 + DEFAULT_PLANS}`,
          '--table-rows': `${1 + DEFAULT_FEATURES + 1}`,
        }}
      >
        <div
          class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__al mp--cell__th mp--cell__thead mp--cell__bts"
          data-column-first
          data-row-first
        ></div>
        {Array.from(new Array(DEFAULT_FEATURES)).map(() => (
          <div class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__al mp--cell__th">
            <div class="mp--skeleton">                                              </div>
          </div>
        ))}
        <div
          class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__bbs mp--cell__al mp--cell__th"
          data-column-first
          data-row-last
        ></div>
        {Array.from(new Array(DEFAULT_PLANS)).map((_, plan) => [
          <div
            class="mp--cell mp--cell__bts mp--cell__thead mp--cell__thead mp--cell__th"
            data-row-first
            data-column-last={plan === DEFAULT_PLANS - 1 || undefined}
          >
            <div class="mp--skeleton">                     </div>
          </div>,
          Array.from(new Array(DEFAULT_FEATURES)).map(() => (
            <div class="mp--cell mp--cell__body">
              <div class="mp--skeleton">                        </div>
            </div>
          )),
          <div
            class="mp--cell mp--cell__body mp--cell__bbs"
            data-row-last
            data-column-last={plan === DEFAULT_PLANS - 1 || undefined}
          ></div>,
        ])}
      </div>
    );
  }
}

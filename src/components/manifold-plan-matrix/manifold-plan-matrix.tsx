import { Component, h, State, Prop, Watch } from '@stencil/core';
import { check, chevron_up_down } from '@manifoldco/icons';
import { ProductQueryVariables, ProductQuery, PlanFeatureType } from '../../types/graphql';
import { toUSD } from '../../utils/cost';
import { CLIENT_ID_WARNING } from './warning';
import query from './product.graphql';

const GRAPHQL_ENDPOINT = 'https://api.manifold.co/graphql';
const MANIFOLD_CLIENT_ID = 'Manifold-Client-ID';

interface ProductFeatures {
  fixed: {
    [label: string]: ProductQuery['product']['fixedFeatures']['edges'][0]['node'];
  };
  metered: {
    [label: string]: ProductQuery['product']['meteredFeatures']['edges'][0]['node'];
  };
  configurable: {
    [label: string]: ProductQuery['product']['configurableFeatures']['edges'][0]['node'];
  };
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

  fetchProduct(productID: string) {
    const variables: ProductQueryVariables = { id: productID };
    fetch(this.graphqlUrl || GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Connection: 'keep-alive',
        ...(this.clientId ? { [MANIFOLD_CLIENT_ID]: this.clientId } : {}),
      },
      body: JSON.stringify({ query, variables }),
    })
      .then(res => {
        return res.json();
      })
      .then(({ data }: { data?: ProductQuery }) => {
        if (data) {
          this.product = data.product;
          // create map of plan features by type
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
          // create map of plan features
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
      });
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

  displayMetered(feature: ProductPlan['meteredFeatures']['edges'][0]['node']) {
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

  displayConfigurable(feature: ProductPlan['configurableFeatures']['edges'][0]['node']) {
    switch (feature.type) {
      case PlanFeatureType.String:
        return (
          <div class="mp--cell mp--cell__body">
            <div class="mp--select">
              <select class="mp--select__input">
                {(feature.featureOptions || []).map((option, i) => (
                  <option value={option.cost} selected={i === 0}>
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
    if (!this.product) {
      return <div>Loading...</div>;
    }

    if (this.product && !this.product.plans) {
      return <div>error</div>;
    }

    const gridColumns = ((this.product && this.product.plans.edges.length) || DEFAULT_PLANS) + 1; // +1 for features column
    const gridRows =
      (Object.keys({
        ...this.productFeatures.fixed,
        ...this.productFeatures.metered,
        ...this.productFeatures.configurable,
      }).length || DEFAULT_FEATURES) + 2; // +1 for the "Get Started" row

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
        {this.product &&
          this.product.plans.edges.map(({ node: plan }, i) => {
            const lastColumn = i === gridColumns - 2 || undefined;

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
    );
  }
}

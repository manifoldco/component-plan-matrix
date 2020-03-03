import { Component, Element, h, State, Prop } from '@stencil/core';
import {
  ProductQueryVariables,
  ProductQuery,
  PlanFeatureType,
  PlanConfigurableFeatureOption,
  PlanConfigurableFeatureNumericDetails,
  PlanFixedFeature,
} from '../../types/graphql';
import query from './product.graphql';

const GRAPHQL_ENDPOINT = 'https://api.manifold.co/graphql';

type ConditionalClassesObj = {
  [name: string]: boolean;
};
type tierLabel = { tierLabel: string };
type TableRef = {
  [key: string]: tierLabel;
};
type NumericDetails = ProductQuery['product']['plans']['edges'][0]['node']['meteredFeatures']['edges'][0]['node']['numericDetails'];
@Component({
  tag: 'manifold-plan-matrix',
  styleUrl: 'manifold-plan-matrix.css',
})
export class ManifoldPricing {
  // Used to apply css variables to root element
  @Element() el: HTMLElement;
  // Passed product ID to the graphql endpoint
  @Prop() productId?: string = '';
  // Base url for buttons
  @Prop() baseUrl?: string = '/signup';
  // CTA Text for buttons
  @Prop() ctaText?: string = 'Get Started';
  // Graphql enpoint (TEMP)
  @Prop() graphqlUrl?: string = GRAPHQL_ENDPOINT;
  // Product data
  @State() product?: ProductQuery['product'];
  // Plans data
  @State() plans: ProductQuery['product']['plans']['edges'];
  // Table tableRef
  @State() labels: string[];
  // Loading state
  @State() loading = true;

  componentWillLoad() {
    const DEFAULT = 'ziggeo';
    const variables: ProductQueryVariables = { id: this.productId || DEFAULT, first: 50 };
    fetch(this.graphqlUrl || GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables,
      }),
    })
      .then(res => {
        return res.json();
      })
      .then(({ data }) => {
        if (data.product) {
          this.product = data.product;
          this.createPlans();
        }
      });
  }

  createPlans() {
    if (this.product) {
      // Knarley set of reducers to generate a TabelRef object containing a label (DisplayName) and an index to populate the correct cell.
      const features = this?.product?.plans?.edges.reduce((acc, { node }) => {
        // Grab unique fixed
        const fixedFeatures = node?.fixedFeatures?.edges.reduce(
          (fixedAccumulator: TableRef, { node: n }) => {
            // Check if key exists
            if (fixedAccumulator[n.displayName]) {
              return fixedAccumulator;
            }
            // Add new key
            return {
              [n.label]: {
                tierLabel: n.displayName,
              },
              ...fixedAccumulator,
            };
          },
          {}
        );

        // Grab unique metered
        const meteredFeatures = node?.meteredFeatures?.edges.reduce(
          (meteredAccumulator: TableRef, { node: n }) => {
            // Check if key exists
            if (meteredAccumulator[n.label]) {
              return meteredAccumulator;
            }
            // Add new key
            return {
              [n.label]: {
                tierLabel: n.displayName,
              },
              ...meteredAccumulator,
            };
          },
          {}
        );

        const configurableFeatures = node?.configurableFeatures?.edges.reduce(
          (fixedAccumulator: TableRef, { node: n }) => {
            if (fixedAccumulator[n.displayName]) {
              return fixedAccumulator;
            }
            return {
              [n.label]: {
                tierLabel: n.displayName,
              },
              ...fixedAccumulator,
            };
          },
          {}
        );

        return { ...fixedFeatures, ...meteredFeatures, ...configurableFeatures, ...acc };
      }, {});
      const tierLabels =
        (features && Object.values(features).map((feature: tierLabel) => feature.tierLabel)) || [];
      this.labels = tierLabels;
      this.plans = this.product?.plans?.edges;
      this.loading = false;
    } else {
      console.warn('There was a problem with the API');
    }
  }

  addClass(obj: ConditionalClassesObj, baseClass = ''): string {
    const conditionalClasses = Object.keys(obj).map(cl => (obj[cl] ? cl : ''));
    return `${baseClass} ${conditionalClasses.join(' ')}`;
  }

  fixedFeatures(displayValue: PlanFixedFeature['displayName'], planIndex: number) {
    if (displayValue === 'true' || displayValue === 'false') {
      return (
        <div class="mp--cell mp--cell__body">
          <manifold-checkbox
            input-id={`${planIndex}-${displayValue}`}
            name={displayValue}
            checked={displayValue === 'true'}
          ></manifold-checkbox>
        </div>
      );
    }
    return <div class="mp--cell mp--cell__body">{displayValue}</div>;
  }

  meteredFeatures(numericDetails: NumericDetails) {
    if (numericDetails.costTiers.length === 0) {
      return (
        <div class="mp--cell mp--cell__body">
          <manifold-empty-cell></manifold-empty-cell>
        </div>
      );
    }

    return (
      <div class="mp--cell mp--cell__body mp--cell__block">
        <manifold-metered>
          {numericDetails.costTiers.map(({ limit, cost }, i) => {
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
        </manifold-metered>
      </div>
    );
  }

  configurableFeatures(
    type: PlanFeatureType,
    numericDetails?: PlanConfigurableFeatureNumericDetails,
    featureOptions?: PlanConfigurableFeatureOption[]
  ) {
    switch (type) {
      case PlanFeatureType.String:
        return (
          <div class="mp--cell mp--cell__body">
            <manifold-select options={featureOptions}></manifold-select>
          </div>
        );
      case PlanFeatureType.Number:
        return (
          <div class="mp--cell mp--cell__body">
            <manifold-numeric-input
              min={numericDetails?.min}
              max={numericDetails?.max}
              increment={numericDetails?.increment}
              unit={numericDetails?.unit}
            ></manifold-numeric-input>
          </div>
        );
      case PlanFeatureType.Boolean:
      default:
        return (
          <div class="mp--cell mp--cell__body">
            <manifold-empty-cell></manifold-empty-cell>
          </div>
        );
    }
  }

  render() {
    if (this.loading) {
      return <div>Loading...</div>;
    }

    if (this.product && !this.product.plans) {
      return <div>error</div>;
    }

    const gridColumns = this.plans.length + 1;
    const gridRows = this.labels.length + 2; // +1 for the "Get Started" row

    // Pass column count into css grid
    this.el.style.setProperty('--manifold-table-columns', `${gridColumns}`);
    this.el.style.setProperty('--manifold-table-rows', `${gridRows}`);

    return (
      <div class="mp">
        <div class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__al mp--cell__th mp--cell__thead mp--cell__bts mp--cell__rounded-tl"></div>
        {this.labels.map(label => {
          return (
            <div class="mp--cell  mp--cell__sticky mp--cell__bls mp--cell__al mp--cell__th">
              {label}
            </div>
          );
        })}
        <div class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__bbs mp--cell__al mp--cell__th mp--cell__rounded-bl"></div>
        {this.plans
          .sort((a, b) => a.node.cost - b.node.cost)
          .map((plan, i) => [
            <div
              class={this.addClass(
                {
                  'mp--cell__rounded-tr': i === gridColumns - 2,
                },
                'mp--cell mp--cell__bts mp--cell__thead mp--cell__thead mp--cell__th'
              )}
            >
              <manifold-thead title-text={plan.node.displayName} plan={plan}></manifold-thead>
            </div>,
            this.labels.map((label, ii) => {
              const fixedFeatureMatch = plan.node.fixedFeatures.edges.find(
                ({ node: { displayName } }) => {
                  return label === displayName;
                }
              );

              const meteredFeaturesMatch = plan.node.meteredFeatures.edges.find(
                ({ node: { displayName } }) => {
                  return label === displayName;
                }
              );

              const configurableFeaturesMatch = plan.node.configurableFeatures.edges.find(
                ({ node: { displayName } }) => {
                  return label === displayName;
                }
              );

              if (fixedFeatureMatch) {
                return this.fixedFeatures(fixedFeatureMatch.node.displayValue, ii);
              }

              if (meteredFeaturesMatch) {
                return this.meteredFeatures(meteredFeaturesMatch.node.numericDetails);
              }

              if (configurableFeaturesMatch) {
                return this.configurableFeatures(
                  configurableFeaturesMatch.node.type,
                  configurableFeaturesMatch.node.numericDetails,
                  configurableFeaturesMatch.node.featureOptions
                );
              }

              return (
                <div class="mp--cell mp--cell__body">
                  <manifold-empty-cell></manifold-empty-cell>
                </div>
              );
            }),
            <div
              class={this.addClass(
                {
                  'mp--cell__brs mp--cell__rounded-br': i === gridColumns - 2,
                },
                'mp--cell mp--cell__body mp--cell__bbs'
              )}
            >
              <manifold-button href={this.baseUrl}>{this.ctaText}</manifold-button>
            </div>,
          ])}
      </div>
    );
  }
}

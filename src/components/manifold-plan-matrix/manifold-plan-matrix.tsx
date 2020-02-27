import { Component, Element, h, State, Prop } from '@stencil/core';
import { ProductQueryVariables, ProductQuery } from 'types/graphql';
import query from './product.graphql';

const GRAPHQL_ENDPOINT = 'https://api.manifold.co/graphql';

type conditionalClassesObj = {
  [name: string]: boolean;
};

@Component({
  tag: 'manifold-plan-matrix',
  styleUrl: 'manifold-plan-matrix.css',
})
export class ManifoldPricing {
  // Used to apply css variables to root element
  @Element() el: HTMLElement;
  // Passed product label to the graphql endpoint
  @Prop() productLabel?: string = '';
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
  // Table labels
  @State() labels: string[] = [];
  // Loading state
  @State() loading = true;

  componentWillLoad() {
    const DEFAULT = 'ziggeo';
    const variables: ProductQueryVariables = { label: this.productLabel || DEFAULT, first: 50 };
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
      const plan = this.product.plans.edges.slice(0, 1).pop();
      if (plan) {
        const fixedFeatures = plan.node.fixedFeatures.edges.map(edge => edge.node.displayName);
        // const meteredFeatures = plan.node.meteredFeatures.edges.map(edge => edge.node.displayName);
        // const configurableFeatures = plan.node.configurableFeatures.edges.map(
        //   edge => edge.node.displayName
        // );

        this.labels = [...fixedFeatures];
        this.plans = this.product.plans.edges;
        this.loading = false;
      }
    } else {
      console.warn('There was a problem with the API');
    }
  }

  addClass(obj: conditionalClassesObj, baseClass = ''): string {
    const conditionalClasses = Object.keys(obj).map(cl => (obj[cl] ? cl : ''));
    return `${baseClass} ${conditionalClasses.join(' ')}`;
  }

  fixedFeatures(displayValue: string, planIndex: number, rowIndex: number) {
    if (displayValue === 'true' || displayValue === 'false') {
      return (
        <manifold-checkbox
          input-id={`${planIndex}-${this.labels[rowIndex]}`}
          name={this.labels[rowIndex]}
          checked={displayValue === 'true'}
        ></manifold-checkbox>
      );
    }
    return displayValue;
  }

  meteredFeatures() {
    return '';
  }

  configurableFeatures() {
    return '';
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
            plan.node.fixedFeatures.edges.map((value, ii) => (
              <div class="mp--cell mp--cell__body">
                {this.fixedFeatures(value.node.displayValue, i, ii)}
              </div>
            )),
            // TODO add metered and configurable features
            // plan.node.meteredFeatures.edges.map((value, ii) => (
            // <div class="mp--cell mp--cell__body">
            //     {this.meteredFeatures(value.node.displayValue, i, ii)}
            //   </div>
            // )),
            // plan.node.configurableFeatures.edges.map((value, ii) => (
            // <div class="mp--cell mp--cell__body">
            //     {this.configurableFeatures(value.node.displayValue, i, ii)}
            //   </div>
            // )),
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

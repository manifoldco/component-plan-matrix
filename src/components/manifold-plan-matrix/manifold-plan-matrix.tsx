import { Component, Element, h, State, Prop } from '@stencil/core';
import { ProductQueryVariables, Product } from 'types/graphql';
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
  @Prop() productLabel: string;
  // Url for price Edge cta
  @Prop() actionUrl: string;
  // Product data
  @State() product: Product;
  // Plans data
  @State() plans: any[];
  // Table labels
  @State() labels: string[] = [];
  // Loading state
  @State() loading = true;

  componentWillLoad() {
    const variables: ProductQueryVariables = { label: this.productLabel, first: 50 };
    fetch(GRAPHQL_ENDPOINT, {
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
        this.product = data.product;
        this.createPlans();
      });
  }

  createPlans() {
    if (this.product.plans && Array.isArray(this.product.plans.edges)) {
      const plans = this.product.plans.edges.map(({ node }) => {
        return { ...node };
      });

      this.labels = Object.keys(plans[0]);
      this.plans = plans;
      this.loading = false;
    } else {
      console.warn('There was a problem with the API');
    }
  }

  addClass(obj: conditionalClassesObj, baseClass = ''): string {
    const conditionalClasses = Object.keys(obj).map(cl => (obj[cl] ? cl : ''));
    return `${baseClass} ${conditionalClasses.join(' ')}`;
  }

  cellSelect(val: any, planIndex: number, rowIndex: number) {
    if (rowIndex === 0 && this.product.plans && typeof val === 'string') {
      return (
        <manifold-thead
          title-text={val}
          plan={this.product.plans.edges[planIndex]}
        ></manifold-thead>
      );
    }

    switch (val) {
      case typeof val === 'boolean':
        return (
          <manifold-checkbox
            input-id={`${planIndex}-${this.labels[rowIndex]}`}
            name={this.labels[rowIndex]}
            checked={val}
          ></manifold-checkbox>
        );
      default:
        return val;
    }
  }

  render() {
    if (this.loading) {
      return <div>Loading...</div>;
    }

    if (!this.product.plans) {
      return <div>error</div>;
    }

    const gridColumns = this.plans.length || 1;
    const gridRows = this.labels.length + 1; // +1 for the "Get Started" row

    // Pass column count into css grid
    this.el.style.setProperty('--manifold-table-columns', `${gridColumns + 1}`);
    this.el.style.setProperty('--manifold-table-rows', `${gridRows}`);

    return (
      <div class="mp">
        <div class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__al mp--cell__th mp--cell__thead mp--cell__bts mp--cell__rounded-tl"></div>
        {this.labels.slice(1, this.labels.length).map(label => (
          <div class="mp--cell  mp--cell__sticky mp--cell__bls mp--cell__al mp--cell__th">
            {label}
          </div>
        ))}
        <div class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__bbs mp--cell__al mp--cell__th mp--cell__rounded-bl"></div>
        {this.plans.map((p, i) => [
          Object.values(p).map((value, ii) => (
            <div
              class={this.addClass(
                {
                  'mp--cell__bts mp--cell__thead mp--cell__thead mp--cell__th': ii === 0,
                  'mp--cell__rounded-tr': ii === 0 && i === gridColumns - 1,
                  'mp--cell__body': ii !== 0,
                },
                'mp--cell'
              )}
            >
              {this.cellSelect(value, i, ii)}
            </div>
          )),
          <div
            class={this.addClass(
              {
                'mp--cell__brs mp--cell__rounded-br': i === gridColumns - 1,
              },
              'mp--cell mp--cell__body mp--cell__bbs'
            )}
          >
            <manifold-button href={this.actionUrl} text="Get Started"></manifold-button>
          </div>,
        ])}
      </div>
    );
  }
}

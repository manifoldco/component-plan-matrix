import { Component, Element, h } from '@stencil/core';

type gridStyle = {
  'grid-column-start': string;
  'grid-column-end': string;
  'grid-row-start': string;
  'grid-row-end': string;
};

type conditionalClassesObj = {
  [name: string]: boolean;
};

@Component({
  tag: 'manifold-pricing',
  styleUrl: 'manifold-pricing.css',
})
export class ManifoldPricing {
  @Element() el: HTMLElement;

  // Position grid elements utility
  gridCoords(x: number, y: number): gridStyle {
    return {
      'grid-column-start': `${x}`,
      'grid-column-end': `${x}`,
      'grid-row-start': `${y}`,
      'grid-row-end': `${y}`,
    };
  }

  addClass(obj: conditionalClassesObj, baseClass = ''): string {
    const conditionalClasses = Object.keys(obj).map(cl => (obj[cl] ? cl : ''));
    return `${baseClass} ${conditionalClasses.join(' ')}`;
  }

  render() {
    // Fake data
    const plan = {
      Name: 'Free',
      Price: 'Free',
      Users: '1',
      'Live Streaming Tail': true,
      'CLI Tail': false,
    };
    const plan2 = {
      Name: 'Birch',
      Price: '$1.50/GB',
      Users: 'Up to 5',
      'Live Streaming Tail': false,
      'CLI Tail': false,
    };
    const plan3 = {
      Name: 'Maple',
      Price: '$2.00/GB',
      Users: 'Up to 10',
      'Live Streaming Tail': false,
      'CLI Tail': false,
    };
    const lables = Object.keys(plan);
    const plans = [plan, plan2, plan3, plan];
    const gridColumns = plans.length;

    // Pass column count into css grid
    this.el.style.setProperty('--manifold-table-columns', `${gridColumns}`);

    return (
      <div class="manifold-pricing">
        <div
          class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__al mp--cell__thead mp--cell__bts mp--cell__rounded-tl"
          style={this.gridCoords(1, 1)}
        ></div>
        {lables.slice(1, lables.length).map((label, i) => (
          <div
            class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__al mp--cell__thead"
            style={this.gridCoords(1, i + 2)}
          >
            {label}
          </div>
        ))}
        <div
          class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__al mp--cell__thead mp--cell__rounded-bl"
          style={this.gridCoords(1, 6)}
        ></div>
        {plans.map((p, i) => [
          Object.values(p).map((value, ii) => (
            <div
              class={this.addClass(
                {
                  'mp--cell__bts mp--cell__thead': ii === 0,
                  'mp--cell__rounded-tr': ii === 0 && i === gridColumns - 1,
                },
                'mp--cell mp--cell__body'
              )}
              style={this.gridCoords(i + 2, ii + 1)}
            >
              <div>
                {typeof value === 'boolean' ? (
                  <input
                    type="checkbox"
                    id={`${i}-${lables[ii]}`}
                    name={lables[ii]}
                    checked={value}
                    disabled
                  />
                ) : (
                  value
                )}
              </div>
            </div>
          )),
          <div
            class={this.addClass(
              {
                'mp--cell__brs mp--cell__rounded-br': i === gridColumns - 1,
              },
              'mp--cell mp--cell__body mp--cell__bbs'
            )}
            style={this.gridCoords(i + 2, 6)}
          >
            <manifold-button href="https://google.com" text="Get Started"></manifold-button>
          </div>,
        ])}
      </div>
    );
  }
}

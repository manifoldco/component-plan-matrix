import { Component, Element, h, Prop } from '@stencil/core';

type conditionalClassesObj = {
  [name: string]: boolean;
};

@Component({
  tag: 'manifold-plan-matrix',
  styleUrl: 'manifold-plan-matrix.css',
})
export class ManifoldPricing {
  @Element() el: HTMLElement;
  @Prop() baseUrl?: string = '/signup';
  @Prop() ctaText?: string = 'Get Started';

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
    const gridRows = Object.keys(plans[0]).length + 1; // Extra row for the "Get Started" row

    // Pass column count into css grid
    this.el.style.setProperty('--manifold-table-columns', `${gridColumns + 1}`);
    this.el.style.setProperty('--manifold-table-rows', `${gridRows}`);

    return (
      <div class="mp">
        <div class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__al mp--cell__th mp--cell__thead mp--cell__bts mp--cell__rounded-tl"></div>
        {lables.slice(1, lables.length).map(label => (
          <div class="mp--cell  mp--cell__sticky mp--cell__bls mp--cell__al mp--cell__th">
            {label}
          </div>
        ))}
        <div class="mp--cell mp--cell__sticky mp--cell__bls mp--cell__bbs mp--cell__al mp--cell__th mp--cell__rounded-bl"></div>
        {plans.map((p, i) => [
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
              {typeof value === 'boolean' ? (
                <manifold-checkbox
                  input-id={`${i}-${lables[ii]}`}
                  name={lables[ii]}
                  checked={value}
                ></manifold-checkbox>
              ) : (
                value
              )}
              {ii === 0 && (
                <p class="mp--plan-cost">
                  $100<span class="mp--subtext">/mo</span>
                </p>
              )}
              {ii === 0 && <span class="mp--subtext"> + metered use</span>}
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
            <manifold-button href={this.baseUrl}>{this.ctaText}</manifold-button>
          </div>,
        ])}
      </div>
    );
  }
}

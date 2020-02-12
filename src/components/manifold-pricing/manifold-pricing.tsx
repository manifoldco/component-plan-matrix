import { Component, h } from '@stencil/core';

@Component({
  tag: 'manifold-pricing',
  styleUrl: 'manifold-pricing.css',
})
export class ManifoldPricing {
  render() {
    const dummy = ['Pricing', 'Total', 'Banana', 'Orange', 'Weight', 'Count', 'Foo', 'Bar'];
    return (
      <div class="manifold-pricing">
        <div class="mp--column mp--mobile-hidden">
          <div class="mp--cell mp--cell__thead"></div>
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div class="mp--cell mp--cell__thead">{dummy[i]}</div>
            ))}
        </div>
        {Array(3)
          .fill(0)
          .map((_, ii) => (
            <div class="mp--column">
              <div class="mp--cell mp--cell__thead mp--cell__bbs">Plan {ii + 1}</div>
              {Array(5)
                .fill(0)
                .map((__, i) => (
                  <div class="mp--cell mp--cell__body">
                    {Math.random() > 0.5 && <div class="mp--mobile-only">{dummy[i]}</div>}
                    <div>
                      {ii.toString()} -- {i.toString()}
                    </div>
                  </div>
                ))}
            </div>
          ))}
      </div>
    );
  }
}

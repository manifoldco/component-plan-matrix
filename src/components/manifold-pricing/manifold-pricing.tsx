import { Component, h } from '@stencil/core';

@Component({
  tag: 'manifold-pricing',
  styleUrl: 'manifold-pricing.css',
})
export class ManifoldPricing {
  render() {
    return (
      <div class="manifold-pricing">
        <div class="manifold-pricing--table">
          <div class="manifold-pricing--cell manifold-pricing--cell__thead manifold-pricing--mobile-hidden"></div>
          <div class="manifold-pricing--cell manifold-pricing--cell__thead">Plan 1</div>
          <div class="manifold-pricing--cell manifold-pricing--cell__thead">Plan 2</div>
          <div class="manifold-pricing--cell manifold-pricing--cell__thead">Plan 3</div>

          {Array(28)
            .fill(0)
            .map((_, i) => {
              if (i % 4) {
                return (
                  <div class="manifold-pricing--cell manifold-pricing--cell__body">
                    {i.toString()}
                  </div>
                );
              }
              return (
                <div class="manifold-pricing--cell manifold-pricing--cell__thead manifold-pricing--mobile-hidden">
                  {i.toString()}
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}

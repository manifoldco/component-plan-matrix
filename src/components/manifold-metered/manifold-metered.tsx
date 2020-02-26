import { Component, h } from '@stencil/core';

@Component({
  tag: 'manifold-metered',
  styleUrl: 'manifold-metered.css',
})
export class ManifoldMetered {
  render() {
    return (
      <div class="mp--metered">
        <div class="mp--metered__header">
          <p class="mp--metered__header-text">cost</p>
          <p class="mp--metered__header-text mp--metered__header-tar">usage range</p>
        </div>
        <slot />
      </div>
    );
  }
}

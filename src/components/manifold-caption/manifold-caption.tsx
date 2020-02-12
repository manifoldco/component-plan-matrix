import { Component, h } from '@stencil/core';

@Component({
  tag: 'manifold-caption',
  styleUrl: 'manifold-caption.css',
})
export class ManifoldCaption {
  render() {
    return (
      <caption>
        <slot />
      </caption>
    );
  }
}

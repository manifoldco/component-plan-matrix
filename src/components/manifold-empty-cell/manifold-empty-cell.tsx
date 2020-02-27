import { Component, h } from '@stencil/core';

@Component({
  tag: 'manifold-empty-cell',
  styleUrl: 'manifold-empty-cell.css',
})
export class ManifoldEmptyCell {
  render() {
    return <span class="mp--empty-cell">•</span>;
  }
}

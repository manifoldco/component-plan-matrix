import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'manifold-button',
  styleUrl: 'manifold-button.css',
})
export class ManifoldButton {
  @Prop() text: string;
  @Prop() href?: string = '';

  render() {
    return (
      <a class="mp--button" href={this.href}>
        {this.text}
      </a>
    );
  }
}

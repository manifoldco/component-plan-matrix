import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'manifold-numeric-input',
  styleUrl: 'manifold-numeric-input.css',
})
export class ManifoldNumericInput {
  @Prop() min?: number = 0;
  @Prop() max?: number = 0;
  @Prop() increment?: number = 0;
  @Prop() unit?: string = '';

  render() {
    return [
      <input
        class="mp--numeric-range"
        type="number"
        name="numericRange"
        id=""
        inputmode="numeric"
        pattern="[0-9]*"
        min={this.min}
        max={this.max}
        step={this.increment}
        value={this.min}
      />,
      <span class="mp--numeric-range__desc">
        {this.min} – {this.max} {this.unit}
      </span>,
    ];
  }
}

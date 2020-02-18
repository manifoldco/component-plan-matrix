import { Component, Prop, h } from '@stencil/core';
import { check } from '@manifoldco/icons';

@Component({
  tag: 'manifold-checkbox',
  styleUrl: 'manifold-checkbox.css',
})
export class ManifoldCheckbox {
  @Prop() inputId: string;
  @Prop() name: string;
  @Prop() checked: boolean;

  render() {
    return [
      <input
        class="manifold-checkbox--input"
        type="checkbox"
        id={this.inputId}
        name={this.name}
        checked={this.checked}
        disabled
      />,
      <svg
        class="manifold-checkbox--check"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        xmlns-x="http://www.w3.org/1999/xlink"
      >
        <path d={check} />
      </svg>,
      <span class="manifold-checkbox--blank">•</span>,
    ];
  }
}

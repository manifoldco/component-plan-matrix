import { Component, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'manifold-toggle',
  styleUrl: 'manifold-toggle.css',
})
export class ManifoldToggle {
  @Prop() off = 0;
  @Prop() on = 1;
  @State() toggle = false;
  @State() selected = 0;

  componentWillRender() {
    this.selected = this.off;
  }

  handleToggle() {
    // TODO hook up the on/off cost with some sort of state management.
    this.toggle = !this.toggle;
    if (this.toggle) {
      this.selected = this.on;
    } else {
      this.selected = this.off;
    }
  }

  render() {
    return [
      <input class="mp--toggle__input" type="checkbox" checked={this.toggle} />,
      <div class="mp--toggle__toggle" onClick={() => this.handleToggle()}></div>,
    ];
  }
}

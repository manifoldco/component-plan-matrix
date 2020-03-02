import { Component, Prop, h } from '@stencil/core';
import { chevron_up_down } from '@manifoldco/icons';
import { PlanConfigurableFeatureOption } from '../../types/graphql';
import { toUSD } from '../../utils/cost';

@Component({
  tag: 'manifold-select',
  styleUrl: 'manifold-select.css',
})
export class ManifoldSelect {
  @Prop() options?: PlanConfigurableFeatureOption[] = [];

  render() {
    return [
      <div class="mp--select__container">
        <select class="mp--select__select">
          {this.options?.map((option, i) => (
            <option value={option.cost} selected={i === 0}>
              <span>{option.displayName}</span>
              <span> ({toUSD(option.cost)})</span>
            </option>
          ))}
        </select>
        <svg
          class="mp--select__chevron"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          xmlns-x="http://www.w3.org/1999/xlink"
        >
          <path d={chevron_up_down} />
        </svg>
        <div class="mp--select__border"></div>
      </div>,
    ];
  }
}

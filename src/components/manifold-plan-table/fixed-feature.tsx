import { FunctionalComponent, h } from '@stencil/core';
import svgCheck from '@manifoldco/mercury/icons/check.svg';

interface FixedProps {
  displayValue: string;
}

const FixedFeature: FunctionalComponent<FixedProps> = ({ displayValue }) => {
  if (['yes', 'true'].includes(displayValue.toLowerCase())) {
    return (
      <div class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Body">
        <div class="ManifoldPlanTable__Check" innerHTML={svgCheck} />
      </div>
    );
  }
  if (displayValue.toLowerCase() === 'false') {
    return (
      <div class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Body">
        <span class="ManifoldPlanTable__Cell__Disabled">•</span>
      </div>
    );
  }

  let display = displayValue;

  // if made up of only integers, format the number more cleanly
  if (/^[0-9]+$/.test(displayValue)) {
    display = new Intl.NumberFormat('en-US', {
      notation: 'compact',
    } as Intl.NumberFormatOptions).format(parseInt(displayValue, 10));
  }

  return <div class="ManifoldPlanTable__Cell ManifoldPlanTable__Cell--Body">{display}</div>;
};

export default FixedFeature;

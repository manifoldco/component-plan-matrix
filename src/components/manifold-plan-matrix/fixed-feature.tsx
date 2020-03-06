import { FunctionalComponent, h } from '@stencil/core';
import { check } from '@manifoldco/icons';

interface FixedProps {
  displayValue: string;
}

const FixedFeature: FunctionalComponent<FixedProps> = ({ displayValue }) => {
  if (['yes', 'true'].includes(displayValue.toLowerCase())) {
    return (
      <div class="mp--cell mp--cell__body">
        <svg
          class="mp--check"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          xmlns-x="http://www.w3.org/1999/xlink"
        >
          <path d={check} />
        </svg>
      </div>
    );
  }
  if (displayValue.toLowerCase() === 'false') {
    return (
      <div class="mp--cell mp--cell__body">
        <span class="mp--empty-cell">•</span>
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

  return <div class="mp--cell mp--cell__body">{display}</div>;
};

export default FixedFeature;

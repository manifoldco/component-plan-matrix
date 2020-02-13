import { storiesOf } from '@storybook/html';
import { withKnobs } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';

storiesOf('Manifold Pricing', module)
  .addDecorator(withKnobs)
  .addDecorator(withA11y)
  .add('manifold-pricing', () => {
    return `<manifold-pricing></manifold-pricing>`;
  });
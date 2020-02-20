import { storiesOf } from '@storybook/html';
import { withKnobs, text } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';

storiesOf('Manifold Pricing', module)
  .addDecorator(withKnobs)
  .addDecorator(withA11y)
  .add('manifold-pricing', () => {
    const productLabel = text('Product Label', 'ziggeo');
    const actionUrl = text('Action Url', 'https://google.com');
    return `<manifold-pricing product-label="${productLabel}" action-url="${actionUrl}"></manifold-pricing>`;
  });

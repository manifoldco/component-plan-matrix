import { storiesOf } from '@storybook/html';
import { withKnobs, text } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';

storiesOf('Manifold Pricing', module)
  .addDecorator(withKnobs)
  .addDecorator(withA11y)
  .add('manifold-plan-matrix', () => {
    const productLabel = text('Product Label', 'ziggeo');
    const cta = text('cta-text', 'Get Started');
    const baseUrl = text('base-url', '/signup');

    return `<manifold-plan-matrix product-label="${productLabel}" base-url="${baseUrl}" cta-text="${cta}"></manifold-plan-matrix>`;
  });

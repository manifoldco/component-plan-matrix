import { storiesOf } from '@storybook/html';
import { withKnobs, text } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';

storiesOf('Manifold Pricing', module)
  .addDecorator(withKnobs)
  .addDecorator(withA11y)
  .add('manifold-plan-matrix', () => {
    const productId = text('Product Label', '234yycr3mf5f2hrw045vuxeatnd50'); // ziggeo
    const clientId = text('Client ID', '234a33rd2pxfzq9qfk0v5qdrykhcp'); // ziggeo provider id
    const cta = text('cta-text', 'Get Started');
    const baseUrl = text('base-url', '/signup');

    return `<manifold-plan-matrix client-id="${clientId}" product-id="${productId}" base-url="${baseUrl}" cta-text="${cta}"></manifold-plan-matrix>`;
  });

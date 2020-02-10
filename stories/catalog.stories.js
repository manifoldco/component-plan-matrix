import { storiesOf } from '@storybook/html';
import { withKnobs } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';

storiesOf('Test story', module)
  .addDecorator(withKnobs)
  .addDecorator(withA11y)
  .add('my-component', () => {
    return `<mui-my-component  first="storybook" last="this is a story"></mui-my-component>`;
  });

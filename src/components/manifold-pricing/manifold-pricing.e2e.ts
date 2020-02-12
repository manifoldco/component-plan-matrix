import { newE2EPage } from '@stencil/core/testing';

describe('manifold-pricing', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<manifold-pricing></manifold-pricing>');
    const element = await page.find('manifold-pricing');
    expect(element).toHaveClass('hydrated');
  });
});

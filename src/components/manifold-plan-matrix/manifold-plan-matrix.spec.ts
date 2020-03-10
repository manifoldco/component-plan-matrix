import { newSpecPage } from '@stencil/core/testing';
import fetchMock from 'fetch-mock';
import { CLIENT_ID_WARNING } from './warning';
import { ManifoldPricing } from './manifold-plan-matrix';

const FAKE_ENDPOINT = 'http://test.com/graphql';

interface Props {
  gatewayUrl?: string;
  graphqlUrl?: string;
  productId?: string;
  clientId?: string;
  baseUrl?: string;
  ctaText?: string;
}

describe(ManifoldPricing.name, () => {
  const originalWarn = console.warn;
  afterAll(() => {
    console.warn = originalWarn;
  });

  let consoleOutput: string;
  const mockedWarn = (output: string) => {
    consoleOutput = output;
  };

  console.warn = mockedWarn;
  beforeEach(() => {
    consoleOutput = '';
  });

  async function setup(props: Props) {
    const page = await newSpecPage({
      components: [ManifoldPricing],
      html: '<div></div>',
    });

    const component = page.doc.createElement('manifold-plan-matrix');

    component.gatewayUrl = props.gatewayUrl;
    component.graphqlUrl = props.graphqlUrl;
    component.productId = props.productId;
    component.clientId = props.clientId;

    const root = page.root as HTMLDivElement;
    root.appendChild(component);
    await page.waitForChanges();

    return { page, component };
  }

  describe('client-id', () => {
    it('missing: should warn', async () => {
      await newSpecPage({
        components: [ManifoldPricing],
        html: `<manifold-plan-matrix></manifold-plan-matrix>`,
      });
      expect(consoleOutput).toEqual(CLIENT_ID_WARNING);
    });

    it('present: no warning', async () => {
      await newSpecPage({
        components: [ManifoldPricing],
        html: `<manifold-plan-matrix client-id="123" ></manifold-plan-matrix>`,
      });
      expect(consoleOutput).toBeFalsy();
    });
  });

  describe('analytics tracking events fireing', () => {
    it('tracks CTA clicks', async () => {
      const productId = '789456123';
      const clientId = '369258147';

      const { page } = await setup({
        productId,
        clientId,
        gatewayUrl: FAKE_ENDPOINT,
        graphqlUrl: FAKE_ENDPOINT,
      });

      const href = page.root && page.root.querySelectorAll(`.mp--button`);
      console.log(href);
      console.log('------------------------------------------------');
      console.log(page.root);
    });

    // it('tracks on load metrics', () => {});
  });
});

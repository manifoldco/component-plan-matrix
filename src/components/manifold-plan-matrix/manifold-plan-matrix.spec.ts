import { newSpecPage } from '@stencil/core/testing';
import fetchMock from 'fetch-mock';
import { ManifoldInit } from '@manifoldco/manifold-init/src/components/manifold-init/manifold-init';
import { CLIENT_ID_WARNING } from './warning';
import { ManifoldPricing } from './manifold-plan-matrix';
import mockLogDna from '../../mocks/graphql/product-logDna.json';

const GRAPHQL_ENDPOINT = 'https://api.manifold.co/graphql';
const REST_ENDPOINT = 'http://test.com/v1';
const ANALYTICS_ENDPOINT = 'https://analytics.manifold.co/v1/events';

interface Props {
  productId?: string;
  clientId?: string;
  baseUrl?: string;
  ctaText?: string;
}

async function setup(props: Props) {
  const page = await newSpecPage({
    components: [ManifoldInit, ManifoldPricing],
    html: `<div><manifold-init client-id="${props.clientId}"></manifold-init></div>`,
  });

  const component = page.doc.createElement('manifold-plan-matrix');

  component.productId = props.productId;
  component.clientId = props.clientId;

  const root = page.root as HTMLDivElement;
  root.appendChild(component);
  await page.waitForChanges();

  return { page, component };
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

  describe('client-id', () => {
    it('missing: should warn', async () => {
      await newSpecPage({
        components: [ManifoldInit, ManifoldPricing],
        html: `
          <div>
            <manifold-init></manifold-init>
            <manifold-plan-matrix></manifold-plan-matrix>
          </div>`,
      });

      expect(consoleOutput).toEqual(CLIENT_ID_WARNING);
    });

    it('present: no warning', async () => {
      await newSpecPage({
        components: [ManifoldInit, ManifoldPricing],
        html: `
          <div>
            <manifold-init></manifold-init>
            <manifold-plan-matrix client-id="123" ></manifold-plan-matrix>
          </div>`,
      });
      expect(consoleOutput).toBeFalsy();
    });
  });

  describe('analytics events fireing', () => {
    beforeEach(() => {
      fetchMock.mock(GRAPHQL_ENDPOINT, mockLogDna);
      fetchMock.mock(REST_ENDPOINT, { cost: 3500, currency: 'USD' });
      fetchMock.mock(ANALYTICS_ENDPOINT, 200);
    });

    afterEach(fetchMock.restore);

    it('tracks CTA clicks', async () => {
      const productId = '789456123';
      const clientId = '369258147';

      const { page } = await setup({
        productId,
        clientId,
      });

      const cta =
        page.root &&
        (page.root.querySelector<HTMLAnchorElement>(
          `[data-cta="cta-button"]`
        ) as HTMLAnchorElement);

      if (!cta) {
        throw new Error('cta not found in document');
      }

      cta.click();

      const [[, analyticsRes]] = fetchMock.calls().filter(call => call[0] === ANALYTICS_ENDPOINT);
      const body = typeof analyticsRes?.body === 'string' && JSON.parse(analyticsRes.body);

      expect(body.type).toContain('component-analytics');
      expect(body.properties.version).toContain('<@NPM_PACKAGE_VERSION@>');
      expect(body.properties.planId.length).toBeGreaterThan(0);
      expect(body.properties.clientId.length).toBeGreaterThan(0);
    });
  });
});

import { newSpecPage } from '@stencil/core/testing';
import { ManifoldInit } from '@manifoldco/manifold-init/src/components/manifold-init/manifold-init';
import fetchMock from 'fetch-mock';
import { CLIENT_ID_WARNING } from './warning';
import { ManifoldPlanTable } from './manifold-plan-table';
import mockLogDna from '../../mocks/graphql/product-logDna.json';
import mockJawsDB from '../../mocks/graphql/product-jawsdb-mysql.json';

// mock AbortController
const globalAny = global as any;
globalAny.AbortController = class AbortController {
  abort() {}
};

const GRAPHQL_ENDPOINT = 'https://api.manifold.co/graphql';
const REST_ENDPOINT = 'begin:https://api.manifold.co/v1';
const ANALYTICS_ENDPOINT = 'https://analytics.manifold.co/v1/events';

interface Props {
  productId?: string;
  clientId?: string;
  baseUrl?: string;
  ctaText?: string;
  version?: string;
}

async function setup(props: Props) {
  const page = await newSpecPage({
    components: [ManifoldInit, ManifoldPlanTable],
    html: `<div><manifold-init client-id="${props.clientId}"></manifold-init></div>`,
  });

  const component = page.doc.createElement('manifold-plan-table');

  component.productId = props.productId;
  component.clientId = props.clientId;
  component.version = props.version;

  const root = page.root as HTMLDivElement;
  root.appendChild(component);
  await page.waitForChanges();

  return { page, component };
}

describe(ManifoldPlanTable.name, () => {
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

  describe('v0 props', () => {
    it('[client-id]: when missing it should warn', async () => {
      await setup({});
      expect(consoleOutput).toEqual(CLIENT_ID_WARNING);
    });

    it('[client-id]: when present it shouldn’t warn', async () => {
      await setup({ clientId: '123' });
      expect(consoleOutput).toBeFalsy();
    });
  });

  describe('v0 integration', () => {
    beforeEach(() => {
      fetchMock.mock(REST_ENDPOINT, { cost: 3500, currency: 'USD' });
      fetchMock.mock(ANALYTICS_ENDPOINT, 200);
    });
    afterEach(fetchMock.restore);

    it('[version]: when latest is provided it is a latest query', async () => {
      fetchMock.mock(GRAPHQL_ENDPOINT, mockJawsDB);
      await setup({ productId: 'product-id', clientId: 'client-id', version: 'latest' });
      const [[, query]] = fetchMock.calls().filter((call) => call[0] === GRAPHQL_ENDPOINT);
      expect(query.body).toContain('"latest":true');
    });

    it('[version]: when version is provided it is not a latest query', async () => {
      fetchMock.mock(GRAPHQL_ENDPOINT, mockJawsDB);
      await setup({ productId: 'product-id', clientId: 'client-id', version: '1' });
      const [[, query]] = fetchMock.calls().filter((call) => call[0] === GRAPHQL_ENDPOINT);
      expect(query.body).toContain('"latest":false');
    });
  });

  describe('analytics', () => {
    beforeEach(() => {
      fetchMock.mock(REST_ENDPOINT, { cost: 3500, currency: 'USD' });
      fetchMock.mock(GRAPHQL_ENDPOINT, mockLogDna);
      fetchMock.mock(ANALYTICS_ENDPOINT, 200);
    });
    afterEach(fetchMock.restore);

    it('click', async () => {
      const productId = '789456123';
      const clientId = '369258147';

      const { page } = await setup({ productId, clientId });

      const forms = page.root.querySelector<HTMLFormElement>('form');

      forms.dispatchEvent(new Event('submit'));

      const [[, analyticsRes]] = fetchMock.calls().filter(([url, body]) => {
        return url === ANALYTICS_ENDPOINT && (body.body as string).includes('"name":"click"');
      });
      const body = typeof analyticsRes?.body === 'string' && JSON.parse(analyticsRes.body);
      const plan = mockLogDna.data.product.plans.edges[0].node;

      expect(body.type).toContain('component-analytics');
      expect(body.properties.version).toContain('<@NPM_PACKAGE_VERSION@>');
      expect(body.properties.planId).toBe(plan.id);
      expect(body.properties.clientId).toBe(clientId);
    });
  });
});

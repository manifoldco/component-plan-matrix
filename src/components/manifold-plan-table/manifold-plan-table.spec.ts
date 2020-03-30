import { newSpecPage } from '@stencil/core/testing';
import { ManifoldInit } from '@manifoldco/manifold-init/src/components/manifold-init/manifold-init';
import fetchMock from 'fetch-mock';
import { CLIENT_ID_WARNING } from './warning';
import { ManifoldPlanTable } from './manifold-plan-table';
import mockLogDna from '../../mocks/graphql/product-logDna.json';
import mockJawsDB from '../../mocks/graphql/product-jawsdb-mysql.json';

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
    components: [ManifoldInit, ManifoldPlanTable],
    html: `<div><manifold-init client-id="${props.clientId}"></manifold-init></div>`,
  });

  const component = page.doc.createElement('manifold-plan-table');

  component.productId = props.productId;
  component.clientId = props.clientId;

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

    it('cta URL', async () => {
      // mock jawsDB endpoint
      fetchMock.mock(GRAPHQL_ENDPOINT, mockJawsDB);

      const PLAN_ID = '235abe2ba8b39e941u2h70ayw5m9j';
      const PLAN_ID_CUSTOM = '235exy25wvzpxj52p87bh87gbnj4y'; // test custom to test features
      const { page } = await setup({ productId: 'product-id', clientId: 'client-id' });
      const cta = page.root && page.root.querySelector(`[id="manifold-cta-plan-${PLAN_ID}"]`);
      const ctaCustom =
        page.root && page.root.querySelector(`[id="manifold-cta-plan-${PLAN_ID_CUSTOM}"]`);

      expect(cta.getAttribute('href')).toBe(`/signup?planId=${PLAN_ID}`);
      // note: this test shouldn’t flake, but if it does, find some way to ensure custom features are tested
      expect(ctaCustom.getAttribute('href')).toBe(
        `/signup?planId=${PLAN_ID_CUSTOM}&backups=1&instance_class=db.t2.micro&redundancy=false&storage=5`
      );
    });

    describe('analytics', () => {
      beforeEach(() => {
        fetchMock.mock(GRAPHQL_ENDPOINT, mockLogDna);
      });

      it('click', async () => {
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

        const [[, analyticsRes]] = fetchMock
          .calls()
          .filter((call) => call[0] === ANALYTICS_ENDPOINT);
        const body = typeof analyticsRes?.body === 'string' && JSON.parse(analyticsRes.body);

        expect(body.type).toContain('component-analytics');
        expect(body.properties.version).toContain('<@NPM_PACKAGE_VERSION@>');
        expect(body.properties.planId.length).toBeGreaterThan(0);
        expect(body.properties.clientId.length).toBeGreaterThan(0);
      });
    });
  });
});

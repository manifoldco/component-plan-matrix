import { newSpecPage } from '@stencil/core/testing';
import { CLIENT_ID_WARNING } from './warning';
import { ManifoldPricing } from './manifold-plan-matrix';

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
});

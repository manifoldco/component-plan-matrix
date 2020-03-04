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

  it('should render with warning if no client ID is set', async () => {
    const page = await newSpecPage({
      components: [ManifoldPricing],
      html: `<manifold-plan-matrix></manifold-plan-matrix>`,
    });

    expect(consoleOutput).toEqual(CLIENT_ID_WARNING);

    expect(page.root).toEqualHtml(`
    <manifold-plan-matrix><div>Loading...</div></manifold-plan-matrix>
  `);
  });

  it('should not render with warning if client ID is set', async () => {
    const page = await newSpecPage({
      components: [ManifoldPricing],
      html: `<manifold-plan-matrix client-id="123" ></manifold-plan-matrix>`,
    });

    expect(consoleOutput).toBeFalsy();

    expect(page.root).toEqualHtml(`
    <manifold-plan-matrix client-id="123"><div>Loading...</div></manifold-plan-matrix>
  `);
  });
});

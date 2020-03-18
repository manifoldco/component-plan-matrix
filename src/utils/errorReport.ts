import analytics from '../packages/analytics';

interface ErrorDetail {
  code?: string;
  componentName?: string;
  message?: string;
  clientId: string;
}

interface ErrorOptions {
  env?: 'local' | 'stage' | 'prod';
  element?: HTMLElement;
}

export function report(detail: ErrorDetail, options?: ErrorOptions) {
  const { element, env = 'prod' } = options || {};
  const extendedDetail = {
    ...detail,
    ...(element ? { componentName: element.tagName } : {}),
    ...(detail.componentName ? { componentName: detail.componentName } : {}),
    version: '<@NPM_PACKAGE_VERSION@>',
  };

  analytics(
    {
      type: 'error',
      name: 'manifold-plan-table_error',
      properties: {
        code: detail.code || '',
        componentName: detail.componentName || (element && element.tagName) || '',
        message: detail.message || '',
        version: extendedDetail.version,
        clientId: detail.clientId || '',
      },
    },
    { env }
  );

  console.error(detail); // report error (Rollbar, Datadog, etc.)
  const evt = new CustomEvent('manifold-error', { bubbles: true, detail: extendedDetail });
  (element || document).dispatchEvent(evt);
}

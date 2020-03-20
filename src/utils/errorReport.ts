import { Connection } from '@manifoldco/manifold-init-types/types/v0';

interface ErrorDetail {
  code?: string;
  message?: string;
}

export function report(analytics: Connection['analytics'], detail: ErrorDetail) {
  analytics.report({
    name: 'mui-pricing-matrix_error',
    code: detail.code,
    message: detail.message,
  });
}

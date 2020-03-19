import { h } from '@stencil/core';
import { report } from './errorReport';
import { mark, measure } from '../packages/analytics';

interface StencilComponent {
  constructor: {
    name: string;
  };
}

export function loadMark<T>() {
  return function loadMarkDecorator(
    _target: T,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    // eslint-disable-next-line no-param-reassign
    descriptor.value = function componentWillLoad() {
      if (this.el) {
        mark(this.el, 'first_render');
        mark(this.el, 'first_render_with_data');
      }
      return originalMethod.apply(this); // call original method
    };

    return descriptor;
  };
}

/* eslint-disable no-param-reassign */

export default function logger<T>() {
  return function loggerDecorator(
    _target: T & StencilComponent,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function render() {
      try {
        const rendered = originalMethod.apply(this); // attempt to call render()
        if (this.el && this.el.tagName.startsWith('MANIFOLD-')) {
          const clientId = this.clientId || '';
          const el = this.el as HTMLElement;

          const loadMeasure = measure(this.el, 'load');
          const firstRenderMeasure = measure(this.el, 'first_render');
          if (performance.getEntriesByName(`${el.tagName}-rtt_graphql-end`).length) {
            // This element has loaded data via graphql, we can report first_render_with_data
            const rttGraphqlMeasure = measure(this.el, 'rtt_graphql');
            const firstRenderWithDataMeasure = this.connection.analytics.measure(
              el,
              'first_render_with_data'
            );
            if (
              firstRenderWithDataMeasure &&
              firstRenderWithDataMeasure.firstReport &&
              rttGraphqlMeasure &&
              loadMeasure
            ) {
              this.conneciton.analytics.track({
                name: 'first_render_with_data',
                type: 'metric',
                properties: {
                  version: '<@NPM_PACKAGE_VERSION@>',
                  duration: firstRenderWithDataMeasure.duration,
                  rttGraphql: rttGraphqlMeasure.duration,
                  load: loadMeasure.duration,
                  clientId,
                },
              });
            }
          }

          if (loadMeasure && loadMeasure.firstReport) {
            this.connection.analytics.track({
              name: 'load',
              type: 'metric',
              properties: {
                version: '<@NPM_PACKAGE_VERSION@>',
                duration: loadMeasure.duration,
                clientId,
              },
            });
          }

          if (firstRenderMeasure && firstRenderMeasure.firstReport) {
            this.connection.analytics.track({
              name: 'first_render',
              type: 'metric',
              properties: {
                version: '<@NPM_PACKAGE_VERSION@>',
                duration: firstRenderMeasure.duration,
                clientId,
              },
            });
          }
        }

        return rendered;
      } catch (e) {
        report(this.connection.analytics, {
          code: e.name || e,
          message: e.message || e,
        });
        return (
          <div>
            <p>Hmm something went wrong.</p>
            <p>{e.message}</p>
          </div>
        ); // show error to user
      }
    };

    return descriptor;
  };
}

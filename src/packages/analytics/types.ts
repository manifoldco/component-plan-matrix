/**
 *  Properties that should be found in every analytics event
 */
interface SharedProperties {
  description?: string;
  source?: 'manifold-plan-table';
  properties: {
    componentName: string;
    version: string;
    clientId: string;
  };
}

/**
 *  Based on `name`, what data should be sent?
 */
export type EventTypes =
  | {
      name: 'load';
      properties: {
        duration: number;
      };
    }
  | {
      name: 'first_render';
      properties: {
        duration: number;
      };
    }
  | {
      name: 'rtt_graphql';
      properties: {
        duration: number;
      };
    }
  | {
      name: 'token_received';
      properties: {
        duration: number;
      };
    }
  | {
      name: 'first_render_with_data';
      properties: {
        duration: number;
        rttGraphql: number;
        load: number;
      };
    }
  | {
      name: 'click';
      properties: {
        planId: string;
      };
    };

export type EventEvent = {
  type: 'metric' | 'component-analytics';
} & SharedProperties &
  EventTypes;

/**
 *  Error analytics event
 */
export interface ErrorEvent extends SharedProperties {
  type: 'error';
  name: 'manifold-plan-table_error';
  properties: {
    code: string;
    componentName: string;
    message: string;
    version: string;
    clientId: string;
  };
  source?: 'manifold-plan-table';
}

export type AnalyticsEvent = ErrorEvent | EventEvent;

import { EventEmitter } from '@stencil/core';
import { Connection, connections } from './connections';

// From UI but stripped some auth/tracking

export interface CreateRestFetch {
  endpoints?: () => Connection;
  env?: () => 'local' | 'stage' | 'prod';
  getAuthToken?: () => string | undefined;
  metrics?: () => boolean;
  onReady?: () => Promise<unknown>;
  retries?: number;
  setAuthToken?: (token: string) => void;
  wait?: () => number;
}

interface RestFetchArguments {
  service: keyof Connection;
  endpoint: string;
  body?: object;
  options?: Omit<RequestInit, 'body'>;
  emitter?: EventEmitter;
}

interface RestFetchEventDetail {
  type: 'manifold-rest-fetch-duration';
  endpoint: string;
  duration: number;
  status: number;
  errorMessage?: string;
}

type Success = undefined;

export type RestFetch = <T>(args: RestFetchArguments) => Promise<T | Success>;

export function createRestFetch({
  endpoints = () => connections.prod,
  onReady = () => new Promise(resolve => resolve()),
}: CreateRestFetch): RestFetch {
  async function restFetch<T>(args: RestFetchArguments): Promise<T | Success> {
    await onReady();

    const rttStart = performance.now();

    const response = await fetch(`${endpoints()[args.service]}${args.endpoint}`, {
      ...args.options,
      body: JSON.stringify(args.body),
    }).catch((e: Response) => {
      /* Handle unexpected errors */
      return Promise.reject(e);
    });

    /* Handle successful responses */
    if ([202, 203, 204].includes(response.status)) {
      return undefined;
    }

    const body = await response.json();

    const fetchDuration = performance.now() - rttStart;
    const detail: RestFetchEventDetail = {
      type: 'manifold-rest-fetch-duration',
      endpoint: args.endpoint,
      duration: fetchDuration,
      status: response.status,
    };

    let message: string | undefined;
    if (Array.isArray(body) && body.length > 0) {
      message = body[0].message;
    } else if (typeof body === 'object') {
      message = body.message;
    }
    if (message) {
      detail.errorMessage = message;
    }
    if (args.emitter) {
      args.emitter.emit(detail);
    } else {
      document.dispatchEvent(
        new CustomEvent('manifold-rest-fetch-duration', {
          bubbles: true,
          detail,
        })
      );
    }

    if (response.status >= 200 && response.status < 300) {
      return body;
    }

    throw new Error(message);
  }

  return function(args: RestFetchArguments) {
    return restFetch(args);
  };
}

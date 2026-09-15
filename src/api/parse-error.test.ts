import { describe, expect, it } from 'vitest';
import { problemSlugToCode, toApiError } from './client';

describe('toApiError', () => {
  it('maps 422 problem with errors member via slug fallback', () => {
    const err = toApiError(422, {
      type: 'https://nodenexusdev.github.io/node_nexus_api/en/errors/validation-error',
      title: 'Unprocessable Entity', status: 422,
      detail: 'Validation failed', request_id: 'req-422',
      errors: { name: ['Field required'] },
    } as never);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('Unprocessable Entity');
    expect(err.detail).toBe('Validation failed');
    expect(err.request_id).toBe('req-422');
  });

  it('maps 429 problem via slug fallback', () => {
    const err = toApiError(429, {
      type: 'https://nodenexusdev.github.io/node_nexus_api/en/errors/rate-limited-error',
      title: 'Too Many Requests', status: 429,
      detail: 'Rate limit exceeded', request_id: 'req-429',
    } as never);
    expect(err.code).toBe('RATE_LIMITED_ERROR');
    expect(err.message).toBe('Too Many Requests');
    expect(err.detail).toBe('Rate limit exceeded');
    expect(err.request_id).toBe('req-429');
  });

  it('maps 504 problem via slug fallback', () => {
    const err = toApiError(504, {
      type: 'https://nodenexusdev.github.io/node_nexus_api/en/errors/gateway-timeout-error',
      title: 'Gateway Timeout', status: 504,
      detail: 'Upstream timed out', request_id: 'req-504',
    } as never);
    expect(err.code).toBe('GATEWAY_TIMEOUT_ERROR');
    expect(err.message).toBe('Gateway Timeout');
    expect(err.detail).toBe('Upstream timed out');
    expect(err.request_id).toBe('req-504');
  });

  it('maps generic 500 problem via slug fallback', () => {
    const err = toApiError(500, {
      type: 'https://nodenexusdev.github.io/node_nexus_api/en/errors/internal-server-error',
      title: 'Internal Server Error', status: 500,
      detail: 'Unexpected failure', request_id: 'req-500',
    } as never);
    expect(err.code).toBe('INTERNAL_SERVER_ERROR');
    expect(err.message).toBe('Internal Server Error');
    expect(err.detail).toBe('Unexpected failure');
    expect(err.request_id).toBe('req-500');
  });

  it('preserves typed code on 409 problem', () => {
    const err = toApiError(409, {
      type: 'https://nodenexusdev.github.io/node_nexus_api/en/errors/node-name-conflict-error',
      title: 'Conflict', status: 409,
      detail: 'Node name already exists', code: 'NodeNameConflictError',
      message: 'Node name already exists', request_id: 'req-409',
      instance: '/api/v2/nodes',
    } as never);
    expect(err.code).toBe('NodeNameConflictError');
    expect(err.message).toBe('Node name already exists');
    expect(err.detail).toBe('Node name already exists');
    expect(err.request_id).toBe('req-409');
  });

  it('slug helper', () => {
    expect(problemSlugToCode('https://x/en/errors/commit-failed-error')).toBe('COMMIT_FAILED_ERROR');
  });
});

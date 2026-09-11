import { describe, expect, it } from 'vitest';
import { problemSlugToCode, toApiError } from './client';

describe('toApiError', () => {
  it('maps problem+json to ApiError', () => {
    const err = toApiError(500, {
      type: 'https://nodenexusdev.github.io/node_nexus_api/en/errors/audit-read-error',
      title: 'Internal Server Error', status: 500,
      detail: 'Audit log request failed', code: 'AuditReadError',
      message: 'Audit log request failed', request_id: 'abc', instance: '/api/v2/audit/x',
    } as never);
    expect(err.code).toBe('AuditReadError');
    expect(err.message).toBe('Audit log request failed');
    expect(err.request_id).toBe('abc');
  });

  it('derives code from type slug when code missing', () => {
    const err = toApiError(501, {
      type: 'https://nodenexusdev.github.io/node_nexus_api/en/errors/audit-stats-unavailable-error',
      title: 'Not Implemented', status: 501, detail: 'Audit stats not available',
    } as never);
    expect(err.code).toBe('AUDIT_STATS_UNAVAILABLE_ERROR');
  });

  it('keeps legacy FastAPI 422 array shape', () => {
    const err = toApiError(422, {
      detail: [{ loc: ['body', 'name'], msg: 'Field required', type: 'missing' }],
    } as never);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toContain('body.name');
  });

  it('keeps legacy domain envelope', () => {
    const err = toApiError(404, {
      code: 'NodeNotFoundError', message: 'Node not found',
      detail: 'Node not found', request_id: 'r1',
    } as never);
    expect(err.code).toBe('NodeNotFoundError');
    expect(err.request_id).toBe('r1');
  });

  it('slug helper', () => {
    expect(problemSlugToCode('https://x/en/errors/commit-failed-error')).toBe('COMMIT_FAILED_ERROR');
  });
});

import { describe, expect, it } from 'vitest'
import {
  bulkResult,
  commandPage,
  commandResponse,
  composeBulkResults,
  containerBulkPage,
  containerBulkResults,
  installResults,
  nodeResponse,
  packResponse,
  problemJson,
  registryResponse,
  scriptResponse,
} from './factories'

describe('mock factories', () => {
  it('bulk envelopes carry total/succeeded/failed', () => {
    const r = bulkResult([
      { status: 'success' },
      { status: 'error', error: 'x' },
    ])
    expect(r).toEqual({ total: 2, succeeded: 1, failed: 1, results: r.results })
  })

  it('install/container/compose results match BulkResult shapes', () => {
    expect(installResults(['a']).total).toBe(1)
    expect(containerBulkResults(['c']).results[0]).toMatchObject({ container_id: 'c' })
    expect(composeBulkResults(['web']).results[0]).toMatchObject({ service: 'web' })
    expect(containerBulkPage([]).has_more).toBe(false)
  })

  it('entity factories produce required fields', () => {
    expect(commandResponse().command).toBe('echo hi')
    expect(commandPage([commandResponse()]).items).toHaveLength(1)
    expect(nodeResponse().connection_type).toBe('ssh')
    expect(scriptResponse().steps).toEqual([])
    expect(packResponse().version).toBe('1.0.0')
    expect(registryResponse().default_branch).toBe('main')
  })

  it('problemJson matches the problem envelope', () => {
    const p = problemJson('PackConflictError', 'exists', 409)
    expect(p).toMatchObject({ code: 'PackConflictError', status: 409 })
    expect(p.type).toContain('pack-conflict-error')
  })
})

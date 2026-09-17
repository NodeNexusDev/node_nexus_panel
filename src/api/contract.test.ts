import { describe, expect, it } from 'vitest'
import spec from './__generated/openapi.json'
import { MIN_BACKEND_MAJOR, MIN_BACKEND_MINOR, isBackendSupported } from './compat'

// All client modules as raw source — paths extracted statically so the test
// stays green only while client URLs match the committed OpenAPI snapshot.
const modules = import.meta.glob('./*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const API_PREFIX = '/api/v2'

function normalizeClientPath(literal: string): string | null {
  let s = literal
    .replace(/\$\{nodesBase\([^)]*\)\}/g, '/nodes/{node_id}/docker')
    .replace(/\$\{composeBase\([^)]*\)\}/g, '/nodes/{node_id}/docker/compose')
    .replace(/composeBase\([^)]*\)/g, '/nodes/{node_id}/docker/compose')
  // drop query-string builders (${qs...}, ?...)
  const cutQs = s.indexOf('${qs')
  if (cutQs !== -1) s = s.slice(0, cutQs)
  const cutQ = s.indexOf('?')
  if (cutQ !== -1) s = s.slice(0, cutQ)
  if (!s.startsWith('/')) return null
  s = s.replace(/\$\{[^}]+\}/g, '{}')
  if (s.includes('${') || s.includes('`')) return null
  return (API_PREFIX + s).replace(/\/+/g, '/')
}

function specHas(method: string, path: string): boolean {
  const specPaths = (spec as { paths: Record<string, Record<string, unknown> > }).paths
  for (const specPath of Object.keys(specPaths)) {
    if (specPath.replace(/\{[^}]+\}/g, '{}') !== path) continue
    return method.toLowerCase() in specPaths[specPath]
  }
  return false
}

interface Call {
  file: string
  method: string
  path: string
}

function extractCalls(): Call[] {
  const calls: Call[] = []
  // Line-based: every api.* call keeps its path literal on one line.
  const callRe = /api\.(get|post|put|patch|delete|getBlob)\b/
  const litRe = /[`'"](\/[^`'"\s]*)[`'"]?/
  for (const [file, src] of Object.entries(modules)) {
    if (file.endsWith('.test.ts')) continue
    for (const line of src.split('\n')) {
      const cm = callRe.exec(line)
      if (!cm) continue
      const lm = litRe.exec(line)
      if (!lm) continue
      const normalized = normalizeClientPath(lm[1])
      if (normalized) {
        calls.push({
          file,
          method: cm[1] === 'getBlob' ? 'get' : cm[1],
          path: normalized,
        })
      }
    }
  }
  return calls
}

describe('openapi contract', () => {
  it('snapshot version is within the supported backend range', () => {
    const version = (spec as { info: { version: string } }).info.version
    expect(version).toMatch(/^2\./)
    expect(isBackendSupported(version)).toBe(true)
    expect(MIN_BACKEND_MAJOR).toBe(2)
    expect(MIN_BACKEND_MINOR).toBe(5)
  })

  it('every client call hits a real spec path+method', () => {
    const calls = extractCalls()
    expect(calls.length).toBeGreaterThan(50)
    const missing = calls.filter((c) => !specHas(c.method, c.path))
    expect(
      missing.map((c) => `${c.method.toUpperCase()} ${c.path} (${c.file})`),
    ).toEqual([])
  })

  it('bulk endpoints used by the client return BulkResult shapes', () => {
    const schemas = (spec as { components: { schemas: Record<string, unknown> } })
      .components.schemas
    for (const name of Object.keys(schemas)) {
      if (!name.startsWith('BulkResult_')) continue
      const schema = schemas[name] as {
        properties?: Record<string, { type?: string }>
        required?: string[]
      }
      for (const key of ['total', 'succeeded', 'failed', 'results']) {
        expect(schema.properties?.[key], `${name}.${key}`).toBeDefined()
      }
    }
  })

  it('problem+json codes used by toApiError exist in the spec', () => {
    const text = JSON.stringify(spec)
    expect(text).toContain('ProblemResponse')
    // numeric error statuses are documented on secured operations
    for (const code of ['"404"', '"409"', '"422"', '"429"']) {
      expect(text).toContain(code)
    }
  })
})

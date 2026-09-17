import { useQuery } from '@tanstack/react-query'
import { env } from '../lib/env'

/** Minimum supported backend (semver): same major, minor >= this. */
export const MIN_BACKEND_MAJOR = 2
export const MIN_BACKEND_MINOR = 5

export interface BackendVersion {
  version: string
  supported: boolean
}

function parseSemver(version: string): [number, number] | null {
  const match = /^v?(\d+)\.(\d+)(?:\.\d+)?(?:[-+].*)?$/.exec(version.trim())
  if (!match) return null
  return [Number(match[1]), Number(match[2])]
}

export function isBackendSupported(version: string): boolean {
  const parsed = parseSemver(version)
  if (!parsed) return false
  const [major, minor] = parsed
  return major === MIN_BACKEND_MAJOR && minor >= MIN_BACKEND_MINOR
}

async function fetchBackendVersion(): Promise<BackendVersion> {
  const response = await fetch(`${env.VITE_API_URL}/openapi.json`)
  if (!response.ok) throw new Error(`openapi.json: HTTP ${response.status}`)
  const spec = (await response.json()) as { info?: { version?: string } }
  const version = spec.info?.version ?? 'unknown'
  return { version, supported: isBackendSupported(version) }
}

/**
 * Backend version probe for the compat banner. Fail-open: unknown version
 * (offline backend, mocks) renders no banner.
 */
export function useBackendVersion() {
  return useQuery<BackendVersion | null>({
    queryKey: ['meta', 'backend-version'],
    queryFn: fetchBackendVersion,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

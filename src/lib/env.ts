interface Env {
  VITE_API_URL: string
  VITE_ENABLE_MOCKS: string
}

const defaults: Env = {
  VITE_API_URL: '',
  VITE_ENABLE_MOCKS: 'false',
}

declare global {
  interface Window {
    __ENV__?: Partial<Env>
  }
}

function isUnset(v: string | undefined): boolean {
  return !v || v === '__VITE_API_URL__' || /^\$\{/.test(v) || /__VITE_/.test(v)
}

function isValidApiUrl(v: string): boolean {
  if (v === '') return true
  if (v.startsWith('/')) return true
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function resolveEnv(): Env {
  const raw = window.__ENV__ ?? {}
  const filtered = Object.fromEntries(
    Object.entries(raw).filter(([, v]) => !isUnset(v as string)),
  ) as Partial<Env>
  const resolved: Partial<Env> = {}
  for (const [k, v] of Object.entries(filtered)) {
    if (k === 'VITE_API_URL' && !isValidApiUrl(v as string)) continue
    ;(resolved as Record<string, string>)[k] = v as string
  }
  return { ...defaults, ...resolved }
}

export const env: Env = resolveEnv()

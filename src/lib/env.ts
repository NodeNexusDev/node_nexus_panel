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
  return !v || /^\$\{/.test(v)
}

function resolveEnv(): Env {
  const raw = window.__ENV__ ?? {}
  const resolved = Object.fromEntries(
    Object.entries(raw).filter(([, v]) => !isUnset(v as string)),
  ) as Partial<Env>
  return { ...defaults, ...resolved }
}

export const env: Env = resolveEnv()

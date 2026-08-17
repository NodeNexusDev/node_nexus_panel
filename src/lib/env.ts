interface Env {
  VITE_API_URL: string
  VITE_WS_URL: string
  VITE_API_KEY: string
  VITE_PANEL_LOGIN: string
  VITE_PANEL_PASSWORD: string
}

const defaults: Env = {
  VITE_API_URL: 'http://localhost:8000',
  VITE_WS_URL: 'ws://localhost:8000',
  VITE_API_KEY: '',
  VITE_PANEL_LOGIN: 'admin',
  VITE_PANEL_PASSWORD: 'password',
}

declare global {
  interface Window {
    __ENV__?: Partial<Env>
  }
}

export const env: Env = { ...defaults, ...window.__ENV__ }

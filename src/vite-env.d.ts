/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_MOCK_EMAIL: string
  readonly VITE_MOCK_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

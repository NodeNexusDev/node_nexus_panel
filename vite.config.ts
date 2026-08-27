import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

function escapeForJsonString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
}

function envSubst(envVars: Record<string, string>) {
  return {
    name: 'env-subst',
    transformIndexHtml(html: string) {
      let result = html.replace(/__VITE_API_URL__/g, escapeForJsonString(envVars['VITE_API_URL'] ?? process.env['VITE_API_URL'] ?? ''))
      result = result.replace(/\$\{(\w+)\}/g, (_, key) => escapeForJsonString(process.env[key] ?? envVars[key] ?? ''))
      return result
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), tailwindcss(), envSubst(env)],
    resolve: {
      alias: { '@': path.resolve(process.cwd(), './src') },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) return 'vendor'
            if (id.includes('@tanstack/react-query')) return 'query'
            if (id.includes('i18next')) return 'i18n'
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) return 'forms'
            return undefined
          },
        },
      },
    },
  }
})

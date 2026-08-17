import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function envSubst(envVars: Record<string, string>) {
  return {
    name: 'env-subst',
    apply: 'serve' as const,
    transformIndexHtml(html: string) {
      return html.replace(/\$\{(\w+)\}/g, (_, key) => process.env[key] ?? envVars[key] ?? '')
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), envSubst(env)],
  }
})

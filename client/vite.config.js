import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  // Load env from the server so both apps share a single source of truth
  // for values like DEFAULT_PASSWORD.
  envDir: path.resolve(dir, '..', 'server'),
  // Only expose vars with these prefixes to the browser bundle.
  // DEFAULT_PASSWORD is exposed; DB secrets (PASSWORD, HOST, ...) are not.
  envPrefix: ['VITE_', 'DEFAULT_'],
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/matzlema/',
  plugins: [vue()],
  base: '/matzlema/', // this is correct
})

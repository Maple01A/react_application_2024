import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  },
  // 以下の行を追加するとエントリーポイントを明示的に指定できます
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
})
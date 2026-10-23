import { defineConfig } from 'vite'

// Relative asset paths work at a domain root and under a GitHub Pages
// project subpath such as https://USERNAME.github.io/REPOSITORY/.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})

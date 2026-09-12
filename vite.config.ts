import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    server: {
      deps: {
        // Necessário no Windows quando o caminho do projeto contém espaços ("ISP Game").
        // Força a transformação inline dos módulos do testing-library/node_modules pelo Vite-node,
        // evitando falha no module resolver ao converter entre URLs codificadas (%20) e caminhos de arquivo nativos.
        inline: [/@testing-library\/.*/, /.*\/node_modules\/.*/],
      },
    },
  },
});





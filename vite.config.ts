import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

function isNodeModulePackage(id: string, packageName: string) {
  const normalizedId = id.replaceAll('\\', '/');
  return normalizedId.includes(`/node_modules/${packageName}/`);
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (isNodeModulePackage(id, 'recharts')) {
            return 'charts';
          }

          if (isNodeModulePackage(id, 'lucide-react')) {
            return 'icons';
          }

          if (
            isNodeModulePackage(id, 'react') ||
            isNodeModulePackage(id, 'react-dom') ||
            isNodeModulePackage(id, 'scheduler') ||
            isNodeModulePackage(id, 'motion')
          ) {
            return 'framework';
          }

          return 'vendor';
        },
      },
    },
  },
  server: {
    // HMR can be disabled externally during automated edits.
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Pour compatibilité si des libs tierces utilisent encore process.env
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@google/genai')) return 'vendor_genai';
              if (id.includes('@supabase')) return 'vendor_supabase';
              if (id.includes('three')) return 'vendor_three';
              if (id.includes('react')) return 'vendor_react';
              return 'vendor';
            }
          }
        }
      }
    }
  };
});
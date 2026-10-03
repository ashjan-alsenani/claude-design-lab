import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works from any static host or sub-folder.
export default defineConfig({


  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // lesson content is its own cacheable file; libraries are split too
        manualChunks(id) {
          // practice banks: one small chunk per unit, loaded only when that unit is practised
          const bank = id.match(/\/src\/data\/practice\/(\w+)\/(\w+)\//);
          if (bank) return `practice-${bank[1]}-${bank[2]}`;
          if (id.includes('/src/data/practice/index.json')) return 'practice-index';
          const ex = id.match(/\/src\/data\/explain\/(\w+)\/(\w+)\//);
          if (ex) return `explain-${ex[1]}-${ex[2]}`;
          if (id.includes('/src/data/')) return 'content';
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'motion';
          if (id.includes('node_modules/react') || id.includes('react-router')) return 'vendor';
        },
      },
    },
  },
});

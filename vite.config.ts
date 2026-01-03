import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',  // ✅ NUOVO
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.REACT_APP_SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || 'https://qoddxlyrltzhkwfuxbdg.supabase.co'),
        'process.env.REACT_APP_SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZGR4bHlybHR6aGt3ZnV4YmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTA4NjUsImV4cCI6MjA4MjU4Njg2NX0.NvDmctXk4hlHuy8Wa1pT1_qkGnubpxsL8TVOThTxtyU')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

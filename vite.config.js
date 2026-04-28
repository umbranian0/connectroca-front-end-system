import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const frontendPort = Number(process.env.FRONTEND_PORT ?? 5173);
const hmrHost = process.env.VITE_HMR_HOST ?? 'localhost';
const hmrProtocol = process.env.VITE_HMR_PROTOCOL ?? 'ws';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: frontendPort,
    strictPort: true,
    hmr: {
      host: hmrHost,
      port: frontendPort,
      clientPort: frontendPort,
      protocol: hmrProtocol,
    },
  },
});

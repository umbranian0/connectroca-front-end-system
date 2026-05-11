import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const frontendPort = Number(process.env.FRONTEND_PORT ?? 5173);
const hmrHost = process.env.VITE_HMR_HOST ?? 'localhost';
const hmrProtocol = process.env.VITE_HMR_PROTOCOL ?? 'ws';
const explicitHmrPort = process.env.VITE_HMR_PORT
  ? Number(process.env.VITE_HMR_PORT)
  : null;

const hmrConfig = {
  host: hmrHost,
  protocol: hmrProtocol,
};

if (Number.isInteger(explicitHmrPort) && explicitHmrPort > 0) {
  hmrConfig.port = explicitHmrPort;
  hmrConfig.clientPort = explicitHmrPort;
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: frontendPort,
    strictPort: false,
    hmr: hmrConfig,
  },
});

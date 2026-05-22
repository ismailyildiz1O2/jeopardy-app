/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for API requests (production only) */
  readonly VITE_API_URL: string;
  /** Socket.io server URL (production only) */
  readonly VITE_SOCKET_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

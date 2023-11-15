/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_LOG_LEVEL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

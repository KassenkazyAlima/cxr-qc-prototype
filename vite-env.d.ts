

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // add other VITE_ variables here if you create them
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

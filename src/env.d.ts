/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_POSTHOG_KEY?: string;
  readonly PUBLIC_POSTHOG_HOST?: string;
}

declare module 'jsdom' {
  export class JSDOM {
    constructor(html: string, options?: Record<string, unknown>);
    window: Window & typeof globalThis;
  }
}

declare namespace Cloudflare {
  interface Env {
    DB?: any;
    BUCKET?: any;
    [key: string]: any;
  }
}

declare module 'cloudflare:workers' {
  export const env: Cloudflare.Env;
}

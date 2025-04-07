declare module 'msw' {
  export const http: any;
  export const HttpResponse: any;
  export const delay: (ms: number) => Promise<void>;
  export const setupWorker: (...handlers: any[]) => any;
}

declare module 'msw/browser' {
  export const setupWorker: (...handlers: any[]) => any;
}

declare module 'msw/node' {
  export const setupServer: (...handlers: any[]) => any;
} 
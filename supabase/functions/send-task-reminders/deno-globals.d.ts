declare module 'https://esm.sh/@supabase/supabase-js@2.57.4' {
  export const createClient: any;
}

declare module 'npm:google-auth-library' {
  export class JWT {
    constructor(config: { email: string; key: string; scopes: string[] });
    authorize(): Promise<{ access_token?: string }>;
  }
}

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

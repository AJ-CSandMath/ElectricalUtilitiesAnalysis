// Type declarations for Deno APIs
declare namespace Deno {
  export interface CreateOptions {
    recursive?: boolean;
  }
  
  export interface ImportMeta {
    url: string;
    main: boolean;
  }
  
  export class errors {
    static AlreadyExists: typeof Error;
    static NotFound: typeof Error;
    static PermissionDenied: typeof Error;
  }
  
  export function cwd(): string;
  export function exit(code?: number): never;
  export function mkdir(path: string, options?: CreateOptions): Promise<void>;
  export function readTextFile(path: string): Promise<string>;
  export function writeTextFile(path: string, data: string): Promise<void>;
} 
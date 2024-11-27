/// <reference lib="deno.ns" />

declare interface ImportMeta {
  url: string;
  main: boolean;
}

declare namespace Deno {
  export interface CommandOptions {
    args: string[];
    cwd?: string;
    env?: Record<string, string>;
    stdout?: "inherit" | "piped" | "null";
    stderr?: "inherit" | "piped" | "null";
  }

  export class Command {
    constructor(command: string, options: CommandOptions);
    output(): Promise<{ code: number; stdout: Uint8Array; stderr: Uint8Array }>;
    spawn(): Promise<CommandProcess>;
  }

  export interface CommandProcess {
    status: Promise<{ success: boolean; code: number }>;
    output(): Promise<Uint8Array>;
    stderrOutput(): Promise<Uint8Array>;
    close(): void;
  }

  export class errors {
    static AddrInUse: typeof Error;
    static NotFound: typeof Error;
    static PermissionDenied: typeof Error;
  }

  export function cwd(): string;
  export function exit(code?: number): never;
  export function listen(options: { port: number }): Promise<Deno.Listener>;
}

declare interface Deno {
  args: string[];
  cwd(): string;
  exit(code?: number): never;
  env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
  };
} 
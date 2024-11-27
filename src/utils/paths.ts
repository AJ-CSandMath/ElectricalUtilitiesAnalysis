import { join } from "../deps.ts";

export const PROJECT_ROOT = new URL("../..", import.meta.url).pathname;
export const DATA_DIR = join(PROJECT_ROOT, "data");
export const PUBLIC_DIR = join(PROJECT_ROOT, "frontend", "public");

export function resolveProjectPath(...paths: string[]): string {
  return join(PROJECT_ROOT, ...paths);
}

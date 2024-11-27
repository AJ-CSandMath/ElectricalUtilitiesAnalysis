import { join } from "../deps.ts";

const dirsToClean = ["dist", ".cache", "node_modules"];

for (const dir of dirsToClean) {
  try {
    const path = join(Deno.cwd(), dir);
    await Deno.remove(path, { recursive: true });
    console.log(`✨ Cleaned ${dir}`);
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      console.error(`Error cleaning ${dir}:`, error);
    }
  }
} 
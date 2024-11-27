import { parse } from "https://deno.land/std@0.177.0/flags/mod.ts";
import { join } from "https://deno.land/std@0.177.0/path/mod.ts";

interface TaskConfig {
  name: string;
  run: () => Promise<void>;
}

const tasks: Record<string, TaskConfig> = {
  start: {
    name: "Start Development Servers",
    run: async () => {
      // Start backend server
      const backend = new Deno.Command("deno", {
        args: ["run", "--allow-net", "--allow-read", "--allow-env", join("src", "server.ts")],
      });

      // Start frontend dev server
      const frontend = new Deno.Command("deno", {
        args: ["run", "--allow-net", "--allow-read", "--allow-env", join("frontend", "server.ts")],
      });

      await Promise.all([
        backend.output(),
        frontend.output(),
      ]);
    },
  },

  clean: {
    name: "Clean Build Directories",
    run: async () => {
      try {
        await Deno.remove("dist", { recursive: true });
        await Deno.remove(".cache", { recursive: true });
        console.log("✨ Cleaned build directories");
      } catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
          throw err;
        }
      }
    },
  },
};

// Parse command line arguments
const args = parse(Deno.args);
const taskName = args._[0]?.toString();

if (!taskName || !tasks[taskName]) {
  console.error("Please specify a valid task to run");
  console.log("Available tasks:");
  Object.entries(tasks).forEach(([name, config]) => {
    console.log(`  ${name}: ${config.name}`);
  });
  Deno.exit(1);
}

await tasks[taskName].run(); 
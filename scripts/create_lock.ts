export {}; // Make this a module

await new Deno.Command("deno", {
  args: ["cache", "--lock=deno.lock", "--lock-write", "./src/deps.ts"],
}).output(); 
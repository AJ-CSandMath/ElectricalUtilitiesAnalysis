import { Application, Context, send, load, join } from "../src/deps.ts";

await load();

const app = new Application();
const port = 8080;

// Basic logging middleware
app.use(async (ctx: Context, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url}`);
  await next();
});

// CORS middleware
app.use(async (ctx: Context, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  await next();
});

// Static file handler with better error handling
app.use(async (ctx: Context) => {
  try {
    const path = ctx.request.url.pathname;
    
    // Special handling for favicon
    if (path === "/favicon.ico") {
      try {
        await send(ctx, "/assets/favicon.ico", {
          root: join(Deno.cwd(), "frontend", "public")
        });
        return;
      } catch {
        // If favicon not found, return empty response
        ctx.response.status = 204;
        return;
      }
    }

    const filePath = path === "/" ? "/index.html" : path;
    await send(ctx, filePath, {
      root: join(Deno.cwd(), "frontend", "public"),
      index: "index.html",
    });
  } catch (error) {
    console.error("Error serving file:", error);
    // For non-favicon 404s, serve index.html
    if (ctx.request.url.pathname !== "/favicon.ico") {
      try {
        await send(ctx, "/index.html", {
          root: join(Deno.cwd(), "frontend", "public"),
        });
      } catch (fallbackError) {
        console.error("Error serving fallback:", fallbackError);
        ctx.response.status = 500;
        ctx.response.body = "Internal server error";
      }
    }
  }
});

const hostname = "127.0.0.1";
console.log(`Frontend server running on http://${hostname}:${port}`);

try {
  await app.listen({ hostname, port });
} catch (error) {
  console.error("Server error:", error);
} 
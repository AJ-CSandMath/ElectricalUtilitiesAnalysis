import { Context, Next } from "../deps.ts";

export const authMiddleware = async (ctx: Context, next: Next) => {
  const authHeader = ctx.request.headers.get("Authorization");
  
  // Skip auth for development
  if (Deno.env.get("ENV") === "development") {
    await next();
    return;
  }

  if (!authHeader) {
    ctx.response.status = 401;
    ctx.response.body = { error: "No authorization header" };
    return;
  }

  try {
    // Your auth logic here
    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid token" };
  }
}; 
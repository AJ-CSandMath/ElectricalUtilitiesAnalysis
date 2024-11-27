import { load } from "../deps.ts";

export interface EnvConfig {
  PORT: number;
  FRONTEND_PORT: number;
  ENV: string;
  JWT_SECRET: string;
}

export async function loadEnv(): Promise<EnvConfig> {
  await load({ export: true });

  return {
    PORT: Number(Deno.env.get("PORT")) || 3000,
    FRONTEND_PORT: Number(Deno.env.get("FRONTEND_PORT")) || 8080,
    ENV: Deno.env.get("ENV") || "development",
    JWT_SECRET: Deno.env.get("JWT_SECRET") ||
      "default-secret-do-not-use-in-production",
  };
}

import {
  Application,
  Context,
  HttpError,
  load,
  Middleware,
  Next,
  oakCors,
  Router,
  State,
} from "./deps.ts";
import utilityRoutes from "./routes/utility.ts";
import { authMiddleware } from "./middleware/auth.ts";

// Load environment variables
await load({
  export: true,
  allowEmptyValues: true,
});

const app = new Application<State>();
const router = new Router();
const port = Number(Deno.env.get("PORT") || 3000);

// Middleware
app.use(oakCors());

// Root route
router.get("/", (ctx) => {
  ctx.response.body = {
    message: "Electrical Utilities API",
    status: "running",
    endpoints: {
      "/api/utilities": "Get utilities data",
      "/api/service-areas": "Get service areas data",
    },
  };
});

// Error handling
const errorHandler: Middleware = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (err) {
    const error = err as HttpError;
    console.error(error);
    ctx.response.status = error.status || 500;
    ctx.response.body = {
      error: error.message,
      status: error.status || 500,
    };
  }
};

app.use(errorHandler);

// Auth middleware for protected routes
app.use(authMiddleware);

// Routes
app.use(router.routes());
app.use(router.allowedMethods());
app.use(utilityRoutes.routes());
app.use(utilityRoutes.allowedMethods());

// Start server
console.log(`🚀 Backend server running on http://localhost:${port}`);
await app.listen({ hostname: "0.0.0.0", port });

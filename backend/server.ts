import { Application, Router } from 'https://deno.land/x/oak@v12.6.1/mod.ts';
import { oakCors } from 'https://deno.land/x/cors@v1.2.2/mod.ts';
import utilityRoutes from '../src/routes/utility.ts';

const app = new Application();
const router = new Router();

// Middleware
app.use(oakCors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: unknown) {
    const error = err as Error;
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
});

// Mount utility routes
app.use(utilityRoutes.routes());
app.use(utilityRoutes.allowedMethods());

// Your existing routes
app.use(router.routes());
app.use(router.allowedMethods());

const port = 3000;
console.log(`Server running on http://localhost:${port}`);
await app.listen({ port });

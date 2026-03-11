import { Hono } from "hono";
import { logger } from 'hono/logger'
import { registry } from "./registry";

const app = new Hono();

app.use('*', logger())

// Exposes Rivet API to communicate with actors
app.all("/api/rivet/*", async (c) => { 
  return registry.handler(c.req.raw);
})

Bun.serve({
  fetch: app.fetch,
  port: Number(process.env.PORT ?? 3000),
  hostname: "0.0.0.0",
  idleTimeout: 120
});
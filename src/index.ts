import { Hono } from "hono";
import { logger } from 'hono/logger'
import { registry } from "./registry";

const app = new Hono();

app.use('*', logger())

// Exposes Rivet API to communicate with actors
app.all("/api/rivet/*", async (c) => { 
  return registry.handler(c.req.raw);
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app;
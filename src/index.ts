import { Hono } from "hono";
import { registry } from "./registry";

const app = new Hono();

// Exposes Rivet API to communicate with actors
app.all("/api/rivet/*", async (c) => { 
  return registry.handler(c.req.raw);
})

app.all("/health", async (c) => { 
  return c.text(`Healthy and running v${process.env.RIVET_RUNNER_VERSION ?? "unknown"}`)
})

export default app;
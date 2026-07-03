import { serve } from "@hono/node-server";
import type { ExecutionContext } from "@cloudflare/workers-types";
import app from "./index.js";

/**
 * Self-hosted fallback runtime. The primary deployment target is Cloudflare Workers
 * (see wrangler.toml); this entry point lets the same Hono app run on any plain Node
 * host (VPS, Fly.io, Render, Railway, ...) if that's ever preferable — e.g. for
 * migrating off free-tier limits once the API is generating revenue.
 */
const port = Number(process.env.PORT ?? 8787);

// Workers' ExecutionContext has no equivalent in plain Node; waitUntil just runs the
// promise without blocking the response, which is a reasonable Node-side approximation.
const nodeExecutionContext = {
  waitUntil: (promise: Promise<unknown>) => {
    void promise;
  },
  passThroughOnException: () => {},
  props: {},
} as unknown as ExecutionContext;

serve(
  {
    fetch: (request: Request) => app.fetch(request, process.env, nodeExecutionContext),
    port,
  },
  (info) => {
    console.log(JSON.stringify({ ts: new Date().toISOString(), level: "info", message: `validate-api listening on port ${info.port}` }));
  },
);

import { Hono } from "hono";
import type { AuthEnv } from "./middleware/auth.js";
import { rapidApiAuth } from "./middleware/auth.js";
import { requestLogger } from "./middleware/logger.js";
import { localRateLimit } from "./middleware/rateLimit.js";
import { healthRoute } from "./routes/health.js";
import { validateRoute } from "./routes/validate.js";
import { passwordRoute } from "./routes/password.js";
import { generateRoute } from "./routes/generate.js";
import { landingRoute } from "./routes/landing.js";

const app = new Hono<AuthEnv>();

app.use("*", requestLogger);
app.onError((err, c) => {
  console.error(JSON.stringify({ ts: new Date().toISOString(), level: "error", message: err.message }));
  return c.json({ error: "internal_error", message: "An unexpected error occurred" }, 500);
});
app.notFound((c) => c.json({ error: "not_found", message: "Unknown endpoint" }, 404));

// Health check stays outside auth so uptime monitors (and RapidAPI's own health probes)
// don't need the proxy secret.
app.route("/", healthRoute);

// Landing page + signup form are public marketing surfaces, not part of the paid API.
app.route("/", landingRoute);

app.use("/v1/*", rapidApiAuth);
app.use("/v1/*", localRateLimit);
app.route("/", validateRoute);
app.route("/", passwordRoute);
app.route("/", generateRoute);

export default app;

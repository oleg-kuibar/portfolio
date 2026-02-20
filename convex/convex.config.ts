import { defineApp } from "convex/server";
import cascadingDeletes from "@convex-dev/cascading-deletes/convex.config.js";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";

const app = defineApp();
app.use(cascadingDeletes);
app.use(rateLimiter);

export default app;

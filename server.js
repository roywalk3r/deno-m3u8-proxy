import { Application } from "oak/mod.ts";
import { cacheRoutes } from "./utils/cache-routes.js";
import { router } from "./routes/routes.js";

const app = new Application();

app.use(cacheRoutes(3600)); // Cache for 1 hour
app.use(router.routes());
app.use(router.allowedMethods());

const port = 4040;

// Deno.serve works both locally and on Deno Deploy (port is ignored on Deploy)
Deno.serve({ port }, app.fetch);
console.log(`✅ Deno proxy server running at http://localhost:${port}`);

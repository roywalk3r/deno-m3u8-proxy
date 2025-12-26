import { Application } from "oak/mod.ts";
import { cacheRoutes } from "./utils/cache-routes.js";
import { router } from "./routes/routes.js";

const app = new Application();

app.use(cacheRoutes(3600)); // Cache for 1 hour
app.use(router.routes());
app.use(router.allowedMethods());

const port = 4040;
// Deno.serve passes ConnInfo as the 2nd arg, but oak's handle expects a Deno.Conn.
// Drop the extra arg to avoid the assertion that was causing 500s on Deploy.
const handler = (request) => app.handle(request);

// Deno.serve works both locally and on Deno Deploy (port is ignored on Deploy)
Deno.serve({ port }, handler);
console.log(`✅ Deno proxy server running at http://localhost:${port}`);

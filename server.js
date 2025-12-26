import { Application } from "oak/mod.ts";
import { cacheRoutes } from "./utils/cache-routes.js";
import { router } from "./routes/routes.js";

const app = new Application();

app.use(cacheRoutes(3600));
app.use(router.routes());
app.use(router.allowedMethods());

// ✅ Deno Deploy expects a fetch FUNCTION here
export default {
  fetch: (req) => app.fetch(req),
};

// (Optional) Local dev only:
// if (import.meta.main) {
//   console.log("✅ Local server running at http://localhost:4040");
//   await app.listen({ port: 4040 });
// }

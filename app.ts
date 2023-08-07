import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as path from "https://deno.land/std@0.102.0/path/mod.ts";

import { router } from "./routes/routes.ts";

import {
  viewEngine,
  oakAdapter,
  etaEngine,
} from "https://deno.land/x/view_engine@v10.6.0/mod.ts";

const app = new Application();

await app.use(
  viewEngine(oakAdapter, etaEngine, {
    viewRoot: "./views",
  })
);

await app.use(router.routes());

app.use(async (context) => {
  await context.send({
    root: `${Deno.cwd()}`,
    // index: "index.html",
  });
});

await app.listen({ port: 8000 });

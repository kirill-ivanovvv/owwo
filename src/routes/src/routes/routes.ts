import { ResourceController } from "@site/controllers";

import type { App } from "../interfaces";

export const registerRoutes = (app: App) => {
  app.get("/favicon.ico", (req: Request) => {
    console.log("TODO FAVICON!");
    return new Response("static route");
    // ResourceController.get(req)
  });

  app.get("/static", (req: Request) => {
    console.log("static route");
    return new Response("static route");
    // ResourceController.get(req)
  });

  app.get("/api", (req: Request) => {
    console.log("api route");
    return new Response("api route");
    // ResourceController.get(req)
  });

  app.get("/", (req: Request) => {
    return ResourceController.get(req);
  });
};

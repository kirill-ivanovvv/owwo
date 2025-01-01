import type { HttpServerPort } from "@contexts/site-core";
import type { InitProps } from "@contexts/site-core";
import type { RouteType } from "@contexts/site-core";

import { sortRoutesHelper } from "./helpers";
import { findRouteHelper } from "./helpers";

export class BunHttpServerAdapter implements HttpServerPort {
  routes: Array<RouteType> = [];

  async init({ port }: InitProps) {
    this.listen(port);
    console.log("init bun http server adapter");
  }

  listen(port: number) {
    const routes = this.routes;

    const { url } = Bun.serve({
      port: port,
      // static: {
      //   "/": new Response("Hello World"),
      // },
      fetch(req: Request) {
        const reqUrl = new URL(req.url);
        const { pathname } = reqUrl;

        const findedRoute = findRouteHelper(routes, pathname);

        try {
          if (findedRoute) {
            return findedRoute.handler(req);
          }
        } catch (error) {
          if ((error.code = 404)) return new Response("page not found");
        }

        return new Response("internal server error");
      },
    });

    return { url };
  }

  addRoute(route: RouteType) {
    // TODO check route exist and error if exist
    this.routes.push(route);
    this.routes = this.routes.sort(sortRoutesHelper);
  }
}

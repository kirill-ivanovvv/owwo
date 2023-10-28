import * as jose from "jose";

import { eta } from "../config/eta.ts";

import Render from "../controllers/render.controller.js";
import Auth from "../controllers/auth.controller.js";
import Profile from "../controllers/profile.controller.js";
import Page from "../controllers/page.controller.js";
import Element from "../controllers/element.controller.js";

import File from "../middleware/file.middleware.js";
import Data from "../middleware/data.middleware.js";
import sql from "../lib/sql.ts";
import Static from "../controllers/static.controller.js";
import checkAuth from "../middleware/auth.middleware.js";
await sql().init();

const server = Bun.serve({
  port: 8080,
  async fetch(req) {
    const c = {
      url: new URL(req.url),
      method: req.method,
      headers: {
        // "Cache-Control": "public, max-age=31536000",
      },
      cookie: req.headers.get("cookie"),
      referer: req.headers.get("referer"),
      props: {
        client: {
          auth: false,
          type: "viewer",
          mode: "viewer",
        },
      },
    };

    if (c.url.search && c.url.searchParams.get("method"))
      c.method = c.url.searchParams.get("method");

    if (c.url.pathname.split("/").at(1) === "templates") return Static.send(c);

    if (c.url.pathname.split("/").at(1) === "public") {
      if (c.method === "DELETE") return await Static.delete(c);
      else return Static.send(c);
    }

    if (c.url.pathname === "/favicon.ico") return Static.send(c);

    if (c.cookie) c.props.client.auth = await checkAuth(c);

    if (c.url.pathname === "/about") return Render.about(c);

    if (c.url.pathname === "/login") {
      if (c.method === "POST") {
        c.body = req.body;
        return await Auth.authUser(c);
      } else return await Render.login(c);
    }

    if (c.url.pathname === "/logout") return await Auth.logout(c);

    if (c.url.pathname === "/signup") return await Render.signup(c);

    if (c.url.pathname === "/") return Render.index(c);

    if (c.url.pathname.split("/").at(1) === "page") {
      if (c.method === "PUT") {
        return Page.update(req);
      } else if (c.method === "POST") {
        return Element.create(c);
      } else return Render.page(c);
    }

    if (c.url.pathname.split("/").at(1) === "element") {
      if (c.method === "PUT") {
        return Element.update(req);
      } else return Render.element(c);
    }

    if (c.url.pathname) {
      if (c.method === "PUT") {
        return await Profile.update(req);
      } else if (c.method === "POST") {
        return Page.create(c);
      } else return await Render.profile(c);
    }

    return new Response("404!");
  },
});

console.log(`OWWO IS RUNNING AT http://${server.hostname}:${server.port}`);

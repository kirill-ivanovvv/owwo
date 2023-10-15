import { Elysia } from "elysia";

import IndexController from "../controllers/index.js";
import AuthController from "../controllers/auth.js";
import UserController from "../controllers/user.js";
import PageController from "../controllers/page.js";

const router = new Elysia();
// ERROR
router.onError((e) => {
  return new Response(IndexController.renderError(e), {
    headers: {
      "Content-Type": "text/html",
    },
  });
});

// INDEX
router
  .get("/", (c) => {
    return IndexController.renderIndex(c);
  })
  .get("/about", (c) => {
    return IndexController.renderAbout(c);
  })
  .get("/login", (c) => {
    return IndexController.renderLogin(c);
  })
  .get("/signup", (c) => {
    return IndexController.renderSignUp(c);
  });

// AUTH
router
  .post("/signup", (c) => {
    return AuthController.createUser(c);
  })
  .post("/login", (c) => {
    return AuthController.authUser(c);
  })
  .get("/logout", (c) => {
    return AuthController.logout(c);
  });

// USER
router
  .get("/:username", (c) => {
    return UserController.index(c);
  })
  .post("/:username", (c) => {
    return PageController.create(c);
  });

// PAGE
router
  .get("/page/:page_id", (c) => {
    return PageController.index(c);
  })
  .post("/page/:page_id", (c) => {
    if (c.query._method === "DELETE") return PageController.delete(c);
    if (c.query._method === "PUT") return PageController.update(c);
    // return PageController.update(c);
  });

export default router;
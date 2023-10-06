import { ExContext } from "../typescript/interfaces";

import checkEditor from "../utils/checkEditor";

import { Database } from "bun:sqlite";
import { eta } from "../config/eta";

import string from "./sql/_string.ts";
const db = new Database("data/db.sqlite", { create: true });

export default class UserController {
  static async index({ params, cookie_authUsername }: ExContext) {
    const editor$ = checkEditor(params, cookie_authUsername);
    const { username } = params;

    const query_user_id = await string(
      "./controllers/sql/select_userId_users.sql"
    );
    const { user_id } = db.query(query_user_id).get({ $username: username });

    const query_page_id = await string(
      "./controllers/sql/select_pageId_userPages.sql"
    );
    const page_ids = db
      .query(query_page_id)
      .all({ $user_id: user_id })
      .map(({ page_id }) => page_id);

    const query_page = await string("./controllers/sql/select_page.sql");
    let pages = [];
    for (let page_id of page_ids) {
      if (!!page_id) {
        const page = db.query(query_page).get({ $page_id: page_id });
        pages.push(page);
      } else {
        // TODO пробраыавть ошибку в лог, не клиент не возвращать
        console.log("page_id incorrect");
      }
    }

    console.log(pages);

    return eta.render("profile", { params, cookie_authUsername, editor$ });
  }
}

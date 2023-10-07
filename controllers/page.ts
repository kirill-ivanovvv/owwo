import { Database } from "bun:sqlite";
import { ExContext } from "../typescript/interfaces.ts";
import { eta } from "../config/eta";

import SQL from "./sql.ts";

import checkEditor from "../utils/checkEditor.ts";
import string from "./sql/_string.ts";

const db = new Database("data/db.sqlite", { create: true });

export default class PageController {
  static async index({ params, cookie_authUsername }: ExContext) {
    const editor$ = checkEditor(params, cookie_authUsername);
    return eta.render("page", {});
  }
  static async create({ params: { username }, set }: ExContext) {
    SQL.createTable("pages", [
      { name: "page_id", option: "INTEGER PRIMARY KEY AUTOINCREMENT" },
      { name: "title", option: "TEXT" },
      { name: "description", option: "TEXT" },
      { name: "cover", option: "TEXT" },
    ]);

    SQL.createTable("authors", [
      {
        name: "user_id",
        option: "INTEGER",
        type: "primary",
        foreign: {
          column: "user_id",
          parent_table: "users",
          parent_column: "user_id",
          options: "ON DELETE CASCADE ON UPDATE CASCADE",
        },
      },
      {
        name: "page_id",
        option: "INTEGER",
        type: "primary",
        foreign: {
          column: "page_id",
          parent_table: "pages",
          parent_column: "page_id",
          options: "ON DELETE CASCADE ON UPDATE CASCADE",
        },
      },
    ]);

    const query_createTable_userPages = await string(
      "./controllers/sql/createTable_userPages.sql"
    );
    db.query(query_createTable_userPages).run();

    const query_createTrigger_insert_userPages = await string(
      "./controllers/sql/createTrigger_insert_userPages.sql"
    );
    db.query(query_createTrigger_insert_userPages).run();

    const query_insertPage = await string("./controllers/sql/insert_page.sql");
    db.query(query_insertPage).run();

    // TODO Не нравится именно этот момент. протестировать, как это будет себя вести, когда будут писаться несколько человек.
    const query_update_userPages_user_id = await string(
      "./controllers/sql/update_userPages_user_id.sql"
    );
    db.query(query_update_userPages_user_id).run({ $username: username });

    set.redirect = `/${username}`;
    return;
  }
}

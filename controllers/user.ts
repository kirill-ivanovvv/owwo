import { ExContext } from "../typescript/interfaces";

import { Database } from "bun:sqlite";
import { eta } from "../config/eta";

import stringFromSQL from "../utils/stringFromSQL";
const db = new Database("data/db.sqlite", { create: true });

export default class UserController {
  static async index({ params, cookie_authUsername }: ExContext) {
    let editor$;
    if (params.username === cookie_authUsername) {
      editor$ = true;
    }
    return eta.render("profile", { params, cookie_authUsername, editor$ });
  }
}

import { EtaModel } from "../models/eta.model";

export class LogoutController {
  static async index(c) {
    // const params = await Context.getParams(c)
    // const html = await EtaModel.getHtml("Logout", {});
    c.resetAuth();
    return c.redirect("/");
  }
}

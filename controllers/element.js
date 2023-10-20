import { v4 as uuidv4 } from "uuid";
import { marked } from "marked";

import File from "../middleware/file.ts";
import { eta } from "../config/eta";
import sql from "./sql.ts";

export default class ElementController {
  static index(c) {
    const { params } = c;

    c.element = sql("elements")
      .select(["element_id", "text"])
      .where({ element_id: params.element_id })
      .get();

    c.element.src = File.get_src("elements", params.element_id);

    const html = marked.parse(c.element.text);

    c.element.html = html;

    return eta.render("element", c);
  }
  static create(c) {
    const { set, params, cookie } = c;

    const element_id = uuidv4();

    sql("elements")
      .insert({ element_id: element_id, author_id: cookie.auth.user_id })
      .run();

    sql("connections")
      .update({ page_id: params.page_id })
      .where({ element_id })
      .run();

    set.redirect = `/element/${element_id}`;
  }
  static async update(c) {
    const { set, params, body } = c;
    const { text, cover, script, style } = body;

    if (!!cover.size) await File.removeCover("elements", params.element_id);

    await File.write("elements", cover, "cover", params.element_id);
    await File.write("elements", script, "script", params.element_id);
    await File.write("elements", style, "style", params.element_id);

    sql("elements")
      .update({ text })
      .where({ element_id: params.element_id })
      .run();

    set.redirect = `/element/${params.element_id}`;
  }

  static async delete(c) {
    const { set, params, cookie } = c;
    await File.removeDir("elements", params.element_id);
    // TODO Удаляется ли connection?
    sql("elements").delete().where({ element_id: params.element_id }).run();
    set.redirect = `/${cookie.username}`;
  }

  static async removeFile(c) {
    const { set, params } = c;
    await File.removeFile("elements", params.element_id, params.file);
    set.redirect = `/element/${params.element_id}`;
  }
}

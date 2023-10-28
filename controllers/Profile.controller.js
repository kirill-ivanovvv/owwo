import File from "../middleware/file.middleware.js";
import sql from "../middleware/sql.ts";
import dbDate from "../middleware/date.js";
import checkOwner from "../middleware/check_owner.js";

import * as fs from "node:fs";
import sharp from "sharp";
// import Body from "../middleware/body.middleware.js";

export default class Profile {
  static async update(req) {
    const url = new URL(req.url);
    const username = url.pathname.split("/").at(1);

    const referer = req.headers.get("referer");

    const formdata = await req.formData();
    const formDataObj = {};
    formdata.forEach((value, key) => (formDataObj[key] = value));

    const { avatar, text, style, script, markup } = formDataObj;

    const user_id = sql("users").select("user_id").where({ username }).get();

    const dir = `./public/data_uploads/users/${user_id}/`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (avatar.size) {
      const extention = avatar.type.split("/").at(1);
      const buf = await avatar.arrayBuffer();

      await File.remove(dir, "avatar");
      await File.write(avatar, dir, `avatar.${extention}`);

      const webp64 = await sharp(buf, { animated: true })
        .webp()
        .resize(64, 64, { fit: "cover" })
        .toBuffer();
      await File.write(webp64, dir, "avatar@webp64.webp");

      const webp190 = await sharp(buf, { animated: true })
        .webp()
        .resize(190, 190, { fit: "cover" })
        .toBuffer();
      await File.write(webp190, dir, "avatar@webp190.webp");
    }

    if (style.size) {
      console.log("write");
      await File.remove(dir, "style");
      await File.write(style, dir, "style.css");
    }

    if (script.size) {
      await File.remove(dir, "script");
      await File.write(script, dir, "script.js");
    }

    return Response.redirect(referer);

    // const {
    //   set,
    //   params: { username },
    //   body,
    // } = c;
    // checkOwner.check(c);

    // if (!!avatar.size) {
    //   await File.removeImage("users", user_id, "avatar");
    //   await File.write_image("users", avatar, "avatar", user_id);
    // }

    // await File.write("users", script, "script", user_id);
    // await File.write("users", style, "style", user_id);

    // try {
    //   sql("users")
    //     .update({ text, markup, date_lastModify: Date.now() })
    //     .where({ user_id })
    //     .run();
    // } catch (e) {
    //   throw new Error("запись не удалась(");
    // }
    //
    // dbDate.update(user_id);
    //
    // const referer = c.request.headers.get("referer");
    // set.redirect = referer;
    // return;
  }

  static async delete(c) {
    // FIX REF
    checkOwner.check(c);
    const { set, params, removeCookie } = c;
    const user_id = sql("users")
      .select("user_id")
      .where({ username: params.username })
      .get();
    const page_ids = sql("authors").select("page_id").where({ user_id }).all();
    if (page_ids.length) {
      page_ids.forEach(async (page_id) => {
        const connections = sql("connections")
          .select("element_id")
          .where({ page_id })
          .all();
        if (connections.length) {
          connections.forEach(async (element_id) => {
            sql("elements").delete().where({ element_id }).run();
            await File.removeDir("elements", element_id);
          });
        }

        await File.removeDir("pages", page_id);
        sql("pages").delete().where({ page_id }).run();
      });
    }

    await File.removeDir("users", user_id);
    sql("users").delete().where({ user_id }).run();

    removeCookie("auth");
    set.redirect = "/";
  }

  static async removeFile(c) {
    const {
      set,
      params: { username, file },
    } = c;
    checkOwner.check(c);

    const user_id = sql("users").select("user_id").where({ username }).get();
    await File.removeFile("users", user_id, file);

    const referer = c.request.headers.get("referer");
    set.redirect = referer;
    return;
  }
}

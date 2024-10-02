import { getTextFileContentHelper } from "@site/helpers";
import { convertMdHtmlHelper } from "@site/helpers";
import { NodeModel } from "@site/models";
import { NodeTestModel } from "@site/models";
import { ClientModel } from "@site/models";
import { HomePage } from "@site/svelte-templates";
import { AboutPage } from "@site/svelte-templates";
import { LoginPage } from "@site/svelte-templates";
import { SignupPage } from "@site/svelte-templates";
import { NodePage } from "@site/svelte-templates";
import { NodeExtendedPage } from "@site/svelte-templates";
import { html } from "@stricjs/app/send";
// import { SveltePageView } from "../views/svelte-page.view.js";
import { Bte } from "bun-template-engine";

// TODO to bte docs
const bte = new Bte();
await bte.init();

type RenderNodePageOptions = {};

export class ViewController {
  static async responsePageHtml(svelteComponent, props) {
    const pageHtml = await bte.getPageHtml(svelteComponent, props);
    return html(pageHtml);
  }

  static async renderHomePage() {
    // TODO add conditions to test data render
    // const users = await NodeModel.getNodes("user", 32);
    const TEST_USERS_QUANTITY = 128;
    const nodeId = process.env["TEST_NODE_USERNAME"];
    const node = new NodeTestModel(nodeId);
    await node.initData();
    const users = Array(TEST_USERS_QUANTITY).fill(node.data);
    const props = { users };
    return ViewController.responsePageHtml(HomePage, props);
  }

  static async renderAboutPage() {
    const ABOUT_FILEPATH = "./README.md";
    const text = {};
    text.markdown = await getTextFileContentHelper(ABOUT_FILEPATH);
    text.html = await convertMdHtmlHelper(text.markdown);
    const props = { text };
    return ViewController.responsePageHtml(AboutPage, props);
  }

  static async renderLoginPage() {
    return ViewController.responsePageHtml(LoginPage);
  }

  static async renderSignupPage() {
    return ViewController.responsePageHtml(SignupPage);
  }

  static async renderNodePage(nodeId: string, options: RenderNodePageOptions) {
    const client = new ClientModel();
    let nodeData;

    // TODO move it to helpers or utils or application constants
    // @globals/constants maybe
    const { TEST_NODE_USERNAME, TEST_NODE_PAGE_ID, TEST_NODE_ELEMENT_ID } =
      process.env;
    const testNodeIds = [
      TEST_NODE_USERNAME,
      TEST_NODE_PAGE_ID,
      TEST_NODE_ELEMENT_ID,
    ];

    // TODO to checkTest method
    // TODO move dev name to application constants
    if (
      process.env.NODE_ENV === "developement" &&
      testNodeIds.includes(nodeId)
    ) {
      // const node = new NodeTestModel(nodeId);
      //
      // await node.initData();
      // nodeData = node.data;

      // TODO изменил вложение свойства nodeId - с meta... на this.nodeId - заработало
      // осталось причесать код
      // можно попробовать продублировать свойство

      if (nodeId === TEST_NODE_PAGE_ID) {
        // const node_user = new NodeTestModel(TEST_NODE_USERNAME);
        const node_user = new NodeTestModel({ nodeId: TEST_NODE_USERNAME });
        // await node_user.initData();
        // nodeData.meta.authors = Array(3).fill(node_user.data);

        console.log(node_user.data.meta.id);
        const node_parent = new NodeTestModel({ nodeId: TEST_NODE_PAGE_ID });
        // await node_parent.initData();
        // nodeData.meta.parents = Array(8).fill(node_parent.data);

        console.log(node_user.nodeId);
        console.log(node_parent.nodeId);
      }

      // const node_child = new NodeTestModel(TEST_NODE_PAGE_ID);
      // await node_child.initData();
      // nodeData.meta.childs = Array(8).fill(node_child.data);
    } else {
      nodeData = await NodeModel.get(nodeId);
    }

    // const EDITOR_URL = new URL("", req.url);
    // EDITOR_URL.searchParams.set("editor", true);
    // console.log(`EDITOR URL: ${EDITOR_URL.href}`);
    //
    //
    // const REQUEST_URL = new URL("", req.url);
    // if (REQUEST_URL.searchParams.has("editor", "true")) {
    //   client.isEditor = true;
    //
    //   // client.type = 'creator'
    //   // client.type = 'author'
    //   // client.type = 'pusher'
    //   // client.type = 'viewer'
    // }

    // TODO change node prop name to nodeData prop name
    const props = { client, node: nodeData };

    // if (node_user.data.meta.childs?.length) {
    //   return ViewController.responsePageHtml(NodePage, props);
    // }

    return ViewController.responsePageHtml(NodePage, props);
    // return ViewController.responsePageHtml(NodeExtendedPage, props);
  }

  static async renderErrorPage() {
    return ViewController.responsePageHtml(Error);
  }
}

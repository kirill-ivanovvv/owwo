import { plugin } from "bun";

await plugin({
  name: "svelte loader",
  async setup(build) {
    const { compile } = await import("svelte/compiler");
    const { preprocess } = await import("svelte/compiler");
    const { typescript } = await import("svelte-preprocess");

    build.onLoad({ filter: /\.svelte$/ }, async ({ path }) => {
      const file = await Bun.file(path).text();

      const { code } = await preprocess(
        file,
        typescript({
          // TODO благодаря этому флагу, ошибки на typecheck не дают рендерить страницы. на данный момент сыпятся ошибки, поэтому отключаю
          transpileOnly: true,
          reportDiagnostics: false,
          tsconfigFile: "./tsconfig.svelte.json",
        }),
        { filename: "svelte-test-filename" },
      );

      const content = compile(code, {
        filename: path,
        generate: "ssr",
      });

      return {
        contents: content.js.code,
        loader: "ts",
      };
    });
  },
});

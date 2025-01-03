import type { NodeContentType } from "@site/interfaces";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

const getMarkdown = async (filepath: string): Promise<string> => {
  const textFile = Bun.file(filepath);
  const textMdString = await textFile.text();
  return textMdString;
};

const getHtml = async (markdownString: string): Promise<string> => {
  const textHtmlString = await marked.parse(markdownString);
  const textHtmlCleanString = DOMPurify.sanitize(textHtmlString);
  return textHtmlCleanString;
};

const cutText = (text: string, symbolsQuantity: number): string => {
  if (text.length < symbolsQuantity) return text;
  else {
    const shortenString = text.slice(0, symbolsQuantity);
    const wordsArray = shortenString.split(" ");
    const outputString = wordsArray.slice(0, -1).join(" ") + "...";
    return outputString;
  }
};

const getTextObj = async (filepath: string): Promise<NodeContentType> => {
  const markdown = await getMarkdown(filepath);
  const html = await getHtml(markdown);
  const preview = cutText(markdown, 240);

  return {
    markdown,
    html,
    preview,
  };
};

const CONTENT_FILEPATH = "./test/mock/src/mock-assets/content.mock-asset.md";
export const CONTENT_TEST_DATA = await getTextObj(CONTENT_FILEPATH);

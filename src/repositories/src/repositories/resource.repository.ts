import { ResourceAggregate } from "@site/domain";
import { ResourceMetaEntity } from "@site/domain";
import { ContentEntity } from "@site/domain";
import { CoverEntity } from "@site/domain";
import { ResourceVariantEnum } from "@site/domain";
import { PageVariantEnum } from "@site/domain";
import { ReserverdFilenamesEnum } from "@site/domain";
import type { ContentDto } from "@site/domain";
import { ImageVariantEnum } from "@site/domain";
import { CoverDto } from "@site/domain";
import { ResourceDto } from "@site/domain";
import { BunFile } from "bun";
import DOMPurify from "dompurify";
import { readdir } from "fs/promises";
import { JSDOM } from "jsdom";
import { marked } from "marked";
import { glob } from "node:fs";
import fs from "node:fs";
import { stat } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { join } from "path";

import { getUploadsPath } from "../getters/index.js";

interface GetByPathOptions {
  recursive: boolean;
  isDirectory: boolean;
}

const DEFAULT_OPTIONS: GetByPathOptions = {
  recursive: true,
  isDirectory: true,
};

export class ResourceRepository {
  #uploadsPath: string;
  #ralativePath: string;
  #fullPath: string;
  #file: BunFile;
  #type: ResourceVariantEnum;

  async getByPath(
    resourcePath: string,
    options: GetByPathOptions = DEFAULT_OPTIONS,
  ): Promise<ResourceDto> {
    this.#ralativePath = resourcePath;
    this.#uploadsPath = getUploadsPath();
    this.#fullPath = join(this.#uploadsPath, this.#ralativePath);
    this.#file = Bun.file(this.#fullPath);

    const [meta, content, cover] = await Promise.all([
      this.getMetaByPath(),
      this.getContentByPath(),
      this.getCoverByPath(),
    ]);

    let children: Array<ResourceAggregate>;

    if (options.recursive) {
      children = await this.loadChildrenByPath();
    }

    const resourceAggregate = new ResourceAggregate({
      meta,
      content,
      cover,
      children,
    });

    const resourceDto = resourceAggregate.getDto();
    return resourceDto;
  }

  private async getMetaByPath(): Promise<ResourceMetaEntity> {
    const metaDto = {
      path: this.#ralativePath,
      title: this.getResourceTitle(),
      resourceType: this.getResourceType(),
      pageType: this.getPageType(),
      createdAt: await this.getCreatedAt(),
      updatedAt: await this.getUpdatedAt(),
    };

    const meta = new ResourceMetaEntity(metaDto);
    return meta;
  }

  private async getCreatedAt() {
    // BUG on bun works incorrectly. node - well
    return new Date((await stat(this.#fullPath)).birthtime);
  }

  private async getUpdatedAt() {
    return new Date((await stat(this.#fullPath)).mtime);
  }

  private getResourceTitle() {
    const segments = this.#fullPath.split("/");
    return segments.at(-1);
  }

  private getResourceType(): ResourceVariantEnum {
    switch (this.#file.type) {
      case "application/octet-stream":
        this.#type = ResourceVariantEnum.Directory;
        return ResourceVariantEnum.Directory;
      default:
        this.#type = ResourceVariantEnum.Directory;
        return ResourceVariantEnum.Directory;
    }
  }

  private getPageType(): PageVariantEnum {
    switch (this.#ralativePath) {
      case "/":
        return PageVariantEnum.Index;
      case "/about":
        return PageVariantEnum.About;
      default:
        return PageVariantEnum.Common;
    }
  }

  private async getContentByPath(): Promise<ContentEntity | null> {
    if (this.#type === ResourceVariantEnum.File) {
      // TODO get file content
    }

    const indexHtmlPath = join(
      this.#fullPath,
      ReserverdFilenamesEnum.IndexHtml,
    );
    const indexMarkdownPath = join(
      this.#fullPath,
      ReserverdFilenamesEnum.IndexMd,
    );

    if (!indexHtmlPath || !indexMarkdownPath) return null;

    let contentDto: ContentDto;

    if (fs.existsSync(indexHtmlPath)) {
      const htmlRawContent = await this.getContent(indexHtmlPath);
      const htmlContent = this.getCleanHtml(htmlRawContent);
      const markdownContent = await marked.parse(htmlContent);

      // TODO html to markdown; currently didnt work

      contentDto = {
        html: htmlContent,
        markdown: markdownContent,
        preview: this.getContentPreview(markdownContent),
      };
    } else if (fs.existsSync(indexMarkdownPath)) {
      const markdownContent = await this.getContent(indexMarkdownPath);
      const htmlRawContent = await marked.parse(markdownContent);
      const htmlContent = this.getCleanHtml(htmlRawContent);

      contentDto = {
        html: htmlContent,
        markdown: markdownContent,
        preview: this.getContentPreview(markdownContent),
      };
    } else {
      contentDto = {
        html: "",
        markdown: "",
        preview: "",
      };
    }

    const content = new ContentEntity(contentDto);
    return content;
  }

  private getContentPreview(content: string) {
    const limit = ContentEntity.PREVIEW_SYMBOLS_LIMIT;
    const ellipsis = "...";
    if (content.length <= limit) return content;
    return content.slice(0, limit - ellipsis.length) + ellipsis;
  }

  private getCleanHtml(html: string): string {
    const window = new JSDOM("").window;
    const purify = DOMPurify(window);
    const clean = purify.sanitize(html);
    return clean;
  }

  private async getContent(path: string) {
    const file = await readFile(path);
    const text = file.toString("utf8");
    return text;
  }

  private async getCoverByPath(): Promise<CoverEntity | null> {
    const coverFullPath = await this.getCoverPath();

    if (!coverFullPath) return null;

    let coverDto: CoverDto = {};

    const coverRelativePath = coverFullPath.replace(
      new RegExp(this.#uploadsPath),
      "uploads",
    );

    if (fs.existsSync(coverFullPath)) {
      // TODO cache logic
      coverDto = {
        [ImageVariantEnum.Blob]: coverRelativePath,
        [ImageVariantEnum.Original]: coverRelativePath,
        [ImageVariantEnum.Height_16px]: coverRelativePath,
        [ImageVariantEnum.Height_16px_2x]: coverRelativePath,
        [ImageVariantEnum.Height_32px]: coverRelativePath,
        [ImageVariantEnum.Height_32px_2x]: coverRelativePath,
        [ImageVariantEnum.Width_1080px]: coverRelativePath,
        [ImageVariantEnum.Width_190px]: coverRelativePath,
        [ImageVariantEnum.Width_190px_2x]: coverRelativePath,
      };
    } else return null;

    const cover = new CoverEntity(coverDto);
    return cover;
  }

  private async getCoverPath(): Promise<string> {
    if (this.#file.type === "application/octet-stream") {
      const pattern = join(this.#fullPath, "\\!cover.{png,jpg,jpeg,gif,webp}");

      return new Promise((resolve, reject) => {
        glob(pattern, (err, files) => {
          if (err) {
            return reject(err);
          }
          // FEATURE add a priority to file extentions
          resolve(files[0]);
        });
      });
    } else if (this.#file.type.split("/")[0] === "image") {
      return this.#fullPath;
    }
  }

  private async loadChildrenByPath(): Promise<Array<ResourceDto>> {
    const dirEntries = await readdir(this.#fullPath, { withFileTypes: true });
    return Promise.all(
      dirEntries.map(async (dirent) => {
        const resourcePath = join(this.#ralativePath, dirent.name);
        const resource = new ResourceRepository();
        return resource.getByPath(resourcePath, {
          isDirectory: dirent.isDirectory(),
          recursive: false,
        });
      }),
    );
  }
}

import { ResourceAggregate } from "@site/domain";
import { ResourceMetaEntity } from "@site/domain";
import { ContentEntity } from "@site/domain";
import { CoverEntity } from "@site/domain";
import { ResourceVariantEnum } from "@site/domain";
import { PageVariantEnum } from "@site/domain";
import type { ContentDto, CoverDto } from "@site/domain";
import { ResourceDto } from "@site/domain";
import { ResourceNotFoundException } from "@site/domain";
import { getUploadsPath } from "@site/domain";
import { readdir } from "fs/promises";
import { existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { join } from "path";

import { getFileCover } from "../getters/index.js";
import { getFileResourceContent } from "../getters/index.js";
import { getDirectoryCoverFullPath } from "../getters/index.js";
import { getDirectoryCover } from "../getters/index.js";
import { getDirectoryContent } from "../getters/index.js";
import { getFileContent } from "../getters/index.js";
import { getContentPreview } from "../getters/index.js";
import { getCleanHtml } from "../getters/index.js";
import { getCssPath } from "../getters/index.js";
import { getJsPath } from "../getters/index.js";

interface GetByPathOptions {
  recursive: boolean;
}

const DEFAULT_OPTIONS: GetByPathOptions = {
  recursive: true,
};

export class ResourceRepository {
  async getByPath(
    relativePath: string,
    options: GetByPathOptions = DEFAULT_OPTIONS,
  ): Promise<ResourceDto> {
    const uploadsPath = getUploadsPath();
    const fullPath = join(uploadsPath, relativePath);

	console.log(fullPath)

    if (!existsSync(fullPath)) throw new ResourceNotFoundException();

    const stats = await stat(fullPath);
    const resourceType = this.getResourceType(stats);

    // TODO сомнительный вариант с getContentByPath
    const meta = await this.getMetaByPath({
      stats,
      fullPath,
      uploadsPath,
      relativePath,
      resourceType,
    });

    const content = await this.getContentByPath({
      resourceType: meta.resourceType,
      fullPath,
      uploadsPath,
    });

    const cover = await this.getCoverByPath({
      fullPath: fullPath,
      uploadsPath: uploadsPath,
      resourceType: meta.resourceType,
    });

    let children: Array<ResourceDto>;

    if (options.recursive && resourceType === ResourceVariantEnum.Directory) {
      children = await this.getChildrenByPath({ fullPath, relativePath });
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

  private async getMetaByPath({
    stats,
    fullPath,
    relativePath,
    uploadsPath,
    resourceType,
  }): Promise<ResourceMetaEntity> {
    // TODO to getters
    let meta = {
      path: relativePath,
      title: this.getResourceTitle(relativePath),
      resourceType,
      pageType: this.getPageType(relativePath),
      // BUG on bun works incorrectly. node - well
      createdAt: new Date(stats.birthtime),
      updatedAt: new Date(stats.mtime),
      jsPath: null,
      cssPath: null,
    };

    if (resourceType === ResourceVariantEnum.Directory) {
      meta.jsPath = getJsPath({ fullPath, uploadsPath });
      meta.cssPath = getCssPath({ fullPath, uploadsPath });
    }

    return new ResourceMetaEntity(meta);
  }

  private getResourceTitle(relativePath: string): string {
    const segments = relativePath.split("/");
    return segments.at(-1);
  }

  private getResourceType(stats): ResourceVariantEnum {
    if (stats.isDirectory()) return ResourceVariantEnum.Directory;
    else if (stats.isFile()) return ResourceVariantEnum.File;
    return ResourceVariantEnum.Directory;
  }

  private getPageType(relativePath): PageVariantEnum {
    switch (relativePath) {
      case "/":
        return PageVariantEnum.Index;
      case "/!about":
        return PageVariantEnum.About;
      default:
        return PageVariantEnum.Common;
    }
  }

  private async getContentByPath({
    resourceType,
    fullPath,
    uploadsPath,
  }): Promise<ContentEntity | null> {
    let content: ContentDto;

    if (resourceType === ResourceVariantEnum.File) {
      content = await getFileResourceContent({
        fullPath,
        uploadsPath,
      });
    } else {
      content = await getDirectoryContent({
        directoryPath: fullPath,
        getFileContent,
        getCleanHtml,
        getContentPreview,
      });
    }

    if (content) {
      return new ContentEntity(content);
    }

    return null;
  }

  private async getCoverByPath({
    resourceType,
    fullPath,
    uploadsPath,
  }): Promise<CoverEntity | null> {
    let cover: CoverDto;

    if (resourceType === ResourceVariantEnum.File) {
      cover = await getFileCover({
        fullPath,
        uploadsPath,
      });
    } else {
      cover = await getDirectoryCover({
        getCoverFullPath: getDirectoryCoverFullPath,
        uploadsPath,
        fullPath,
      });
    }

    if (cover) {
      return new CoverEntity(cover);
    }
    return null;
  }

  private async getChildrenByPath({
    fullPath,
    relativePath,
  }): Promise<Array<ResourceDto>> {
    const dirEntries = await readdir(fullPath, { withFileTypes: true });

    const promises = [];

    dirEntries.forEach(async (dirent) => {
      // TODO symbols enum?
      if (!dirent.name.startsWith("!")) {
        const resourcePath = join(relativePath, dirent.name);
        const repository = new ResourceRepository();
        promises.push(
          repository.getByPath(resourcePath, {
            recursive: false,
          }),
        );
      }
    });

    return Promise.all(promises);
  }
}

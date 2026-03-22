import type { FileProvider } from "./parser/fileProvider.js";
import { MarkdownParser } from "./parser/markdownParser.js";
import type { IndexStore } from "./index/indexStore.js";

export class Indexer {
  constructor(
    private readonly fileProvider: FileProvider,
    private readonly parser: MarkdownParser,
    private readonly indexStore: IndexStore
  ) {}

  async run(): Promise<void> {
    const files = await this.fileProvider.listMarkdownFiles();
    for (const path of files) {
      try {
        const content = await this.fileProvider.readFile(path);
        const doc = this.parser.parse(content, path);
        this.indexStore.save(doc);
      } catch (err) {
        console.warn(`Falha ao indexar ${path}:`, err);
      }
    }
  }
}

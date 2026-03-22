import type { FileProvider } from "../core/parser/fileProvider.js";
import { readFile } from "fs/promises";
import fg from "fast-glob";
import { getConfig } from "./nodeConfigService.js";
import * as os from 'os';
import path from "path";

function inverterBarras(path: string) {
  return path.replace(/\\/g, "/");
}

export class NodeFileProvider implements FileProvider {
  async listMarkdownFiles(): Promise<string[]> {
    if (getConfig()?.targetFolder != null){
      let winpath = os.homedir() + '\\' + getConfig()?.targetFolder + "\\**\\*.md"
      winpath = inverterBarras(winpath)
      console.log("Buscando", winpath)
      return fg(winpath, { ignore: ["node_modules"] });
    }
    let response = "Não foi possível achar sua configuração"
    return [response]
  }

  async readFile(path: string): Promise<string> {
    return readFile(path, "utf-8");
  }

  filenameOnly(stringPath: string): string {
    // if(path.includes('/') || path.includes('\\')){      
    // }
    const filename = path.basename(stringPath)
    return filename;
  }
}

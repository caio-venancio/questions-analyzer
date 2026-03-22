import * as path from 'path';
import * as os from 'os';

import pkg from "fs-extra"
const { readJsonSync } = pkg
const { existsSync } = pkg
const { lstatSync } = pkg
const { writeJsonSync } = pkg


// Define o caminho do arquivo de configuração
const CONFIG_FILENAME = '.QuestionsAnalyserConfig.json';
const configPath = path.join(os.homedir(), CONFIG_FILENAME);

interface Config {
  targetFolder: string;
}

// Função para salvar o path configurado
export function saveConfig(folderPath: string) {
  const config: Config = { targetFolder: folderPath };
  writeJsonSync(configPath, config);
  console.log(`Configuração salva em: ${configPath}`);
}

// Função para ler o path configurado
export function getConfig(): Config | null {
  if (existsSync(configPath)) {
    return readJsonSync(configPath);
  }
  return null;
}

export function checkConfig(): boolean {
  try {
    
      const config = getConfig()
      if (config !== null ){
        checkDirectoryPath(config.targetFolder)
        console.log("Tudo certo com sua configuração.")
        return true
      } else {
        console.log("Arquivo de configuração não existe.")
        return false;
      }

  } catch {
    return false
  }
}

export function checkDirectoryPath(s: string): boolean{
  try {
    // fs.existsSync retorna true se o caminho existir (arquivo ou pasta)
    let configPath = path.join(os.homedir(), s);
    // console.log("O caminho será:", configPath)
    // console.log("resultado 1:", existsSync(configPath))
    if (existsSync(configPath)) {
      // Verifica se o caminho existe E se é um diretório
      // console.log("resultado 2:",  lstatSync(configPath).isDirectory())
      return lstatSync(configPath).isDirectory();
    }
    return false;
  } catch (err) {
    console.log("erro:", err)
    return false;
  }
}
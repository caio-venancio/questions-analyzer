// contrato para pegar arquivos
export interface FileProvider {
  listMarkdownFiles(): Promise<string[]>;
  readFile(path: string): Promise<string>;
  filenameOnly(path: string): string;
}
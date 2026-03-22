<!-- uk english is great -->

Como rodar?

`node --loader ts-node/esm src/cli/index.ts` ou `npm run dev`

1. Escrevi as pastas de arquitetura

Requisitos:
    Operações
        //consulta
        Ver quantas questões já respondi de uma disciplina
        Ver quantas questões já respondi de um conteúdo
        Ver quantos capítulos tem em um conteúdo
        Ver quantas questões tem de uma disciplina
        Ver quantas questões tem de um conteúdo
        Ver quantas questões tem de um capítulo

        //ações
        Revisar questões de um conteúdo
        Revisar questões de uma disciplina
        Revisar questões de um capítulo
        Extrair as novas questões

        //avaliação
        Avaliação pessoal de se questão consegue resumir o conteúdo
        Lista de pontos importantes do conteúdo
        Nota naquele conteúdo em uma prova
        Nota naquele conteúdo em x provas

Partes:
Schema simples
Indexador funcional

Markdown (.md)
   ↓
parser
   ↓
models (Document)
   ↓
index (SQLite / memória)
   ↓
search
   ↓
CLI / Obsidian

- [] o que a camada models geralmente faz?
- [] como rodar projeto em typescript?
- [] O que ts-node/esm faz?
   Usando o loader ts-node/esm para:
      Suportar ES Modules
      Compilar TS em tempo de execução
- [x] Como atravessar um objeto e printar todos os valores de chaves com algum nome?
   Object.entries(usuario).forEach(([chave, valor]) => {
      if (chave.includes("nome")) {
         console.log(`Chave: ${chave}, Valor: ${valor}`);
      }
   });
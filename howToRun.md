Beleza — vou te passar o **caminho mais simples e padrão** pra rodar um projeto em TypeScript localmente, sem dor de cabeça, e já pensando em evoluir pra Obsidian depois.

---

## ✅ Pré-requisitos

* **Node.js ≥ 18**
* **npm** (ou pnpm/yarn)

Verifica:

```bash
node -v
npm -v
```

---

## 1️⃣ Inicializar o projeto

```bash
mkdir md-indexer
cd md-indexer
npm init -y
```

---

## 2️⃣ Instalar dependências

### Dependências de runtime

```bash
npm install gray-matter better-sqlite3 fast-glob
```

### Dependências de desenvolvimento

```bash
npm install -D typescript ts-node @types/node
```

---

## 3️⃣ Criar `tsconfig.json`

```bash
npx tsc --init
```

Edite para algo **simples e funcional**:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

---

## 4️⃣ Estrutura mínima

```
src/
 ├── models/
 ├── files/
 ├── parser/
 ├── index/
 ├── search/
 ├── indexer/
 └── main.ts
```

---

## 5️⃣ Arquivo de entrada (`src/main.ts`)

```ts
import { NodeFileProvider } from "./files/NodeFileProvider";
import { MarkdownParser } from "./parser/MarkdownParser";
import { SqliteIndexStore } from "./index/SqliteIndexStore";
import { Indexer } from "./indexer/Indexer";
import { SearchService } from "./search/SearchService";

async function main() {
  const indexer = new Indexer(
    new NodeFileProvider(),
    new MarkdownParser(),
    new SqliteIndexStore()
  );

  await indexer.run();

  const search = new SearchService(new SqliteIndexStore());
  const results = search.search({ text: "maclaurin" });

  console.log(results);
}

main();
```

---

## 6️⃣ Rodar o projeto (3 jeitos)

### 👉 Opção A — mais simples (recomendada agora)

```bash
npx ts-node src/main.ts
```

---

### 👉 Opção B — compilar e rodar JS

```bash
npx tsc
node dist/main.js
```

---

### 👉 Opção C — dev mode (watch)

```bash
npx ts-node-dev src/main.ts
```

(instale antes)

```bash
npm install -D ts-node-dev
```

---

## ⚠️ Erros comuns

* ❌ `Cannot use import statement outside a module`
  → garanta `"module": "ESNext"` e `"type": "module"` no `package.json`

```json
{
  "type": "module"
}
```

* ❌ erro com `better-sqlite3`
  → rode:

```bash
npm rebuild better-sqlite3
```

---

## 🧠 Dica importante (pensando no Obsidian)

* **NÃO** use caminhos absolutos
* **NÃO** acople nada ao `process.cwd()`
* Tudo deve ser injetável (FileProvider, IndexStore)

Isso facilita virar plugin depois.

---

## 🚀 Próximo passo natural

Agora que roda, você pode:

* adicionar CLI (`commander`)
* melhorar busca (FTS5)
* criar comando no Obsidian
* escrever testes com `MemoryFileProvider`

Se quiser, eu te guio no **passo seguinte certo** pra não refatorar depois.

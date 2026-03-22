import Database from "better-sqlite3";
import type { Book, Document, Question, Chapter } from "../models/document";
import type { IndexStore } from "./indexStore";
import type { Subject, Area } from "../models/academic";

const debug = true;

export class SqliteIndexStore implements IndexStore {
  private db = new Database("index.db");

  constructor() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT,
        path TEXT,
        title TEXT,
        content TEXT
      );

      CREATE TABLE IF NOT EXISTS questions (
        title TEXT PRIMARY KEY NOT NULL,
        question TEXT NOT NULL,
        answer TEXT,
        book_id TEXT,
        chapter INTEGER,
        has_document BOOLEAN DEFAULT 0,
        FOREIGN KEY (book_id, chapter) REFERENCES chapters(book_id, number)
          ON DELETE NO ACTION
      );

      CREATE TABLE IF NOT EXISTS books ( 
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        book_id TEXT UNIQUE,
        edition INTEGER DEFAULT 1,
        has_document BOOLEAN DEFAULT 0,
        UNIQUE(title, edition)
      );

      CREATE TABLE IF NOT EXISTS chapters (
          title TEXT,
          number INTEGER NOT NULL,
          book_id TEXT NOT NULL,
          has_document BOOLEAN DEFAULT 0,
          PRIMARY KEY (book_id, number),
          FOREIGN KEY (book_id) REFERENCES books(book_id)
            ON DELETE NO ACTION
      );

      CREATE TABLE IF NOT EXISTS areas (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL UNIQUE,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS book_area (
        book_id TEXT NOT NULL,
        area_id INTEGER NOT NULL,

        PRIMARY KEY(book_id, area_id),
        FOREIGN KEY (book_id) REFERENCES books(book_id)
          ON DELETE NO ACTION,
        FOREIGN KEY (area_id) REFERENCES areas(id)
          ON DELETE NO ACTION
      );

      CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL UNIQUE,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS subject_area(
        subject_id INTEGER NOT NULL,
        area_id INTEGER NOT NULL,

        PRIMARY KEY(subject_id, area_id),
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
          ON DELETE NO ACTION,
        FOREIGN KEY (area_id) REFERENCES areas(id)
          ON DELETE NO ACTION
      );

      CREATE TABLE IF NOT EXISTS chapter_subject(
        chapter_number INTEGER NOT NULL,
        book_id TEXT NOT NULL,
        subject_id INTEGER NOT NULL,

        PRIMARY KEY(book_id, chapter_number, subject_id),
        FOREIGN KEY (book_id, chapter_number) REFERENCES chapters(book_id, number)
          ON DELETE NO ACTION,
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
          ON DELETE NO ACTION
      );
    `);
  }

  save(doc: Document): void {
    this.db.prepare(`
      INSERT INTO documents (id, path, title, content)
      VALUES (?, ?, ?, ?)
    `).run(doc.id, doc.path, doc.title, doc.content);
  }

  saveQuestion(question: Question): void {
    try {
      this.db.prepare(`
      INSERT INTO questions (title, question, answer, book_id, chapter, has_document)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(question.title, question.question, question.answer, question.bookId, question.chapter, question.hasDocument);
    } catch (err) {
      console.warn('erro eh este:', err)
      console.log('-----------------------------------')
      console.log('A questao que deu erro:', question)
    }
  }

  saveBook(book: Book): void {
    try {
      this.db.prepare(`
      INSERT INTO books (title, book_id, edition, has_document)
      VALUES (?, ?, ?, ?)
    `).run(book.title, book.bookId, book.edition, book.hasDocument);
    } catch (err) {
      if(debug){
        console.warn('erro eh este:', err)
        console.log('-----------------------------------')
        console.log('O livro que deu erro:', book)
      }
    }

    if(book.area){}
    if(book.authors){}
    if(book.chapters){}
    if(book.subjects){}
    if(book.topic){}
  }

  saveChapter(chapter: Chapter): void {
    try {
      this.db.prepare(`
      INSERT INTO chapters (title, book_id, number, has_document)
      VALUES (?, ?, ?, ?)
    `).run(chapter.title, chapter.bookId, chapter.number, chapter.hasDocument);
    } catch (err) {
      console.warn('erro eh este:', err)
      console.log('-----------------------------------')
      console.log('A questao que deu erro:', chapter)
    }

    if(chapter.activities){}
    if(chapter.area){}
    if(chapter.subjects){}
    if(chapter.topic){}
  }

  saveSubject(subject: Subject): void {
    try {
      this.db.prepare(`
      INSERT INTO subjects (title)
      VALUES (?)
    `).run(subject.title);
    } catch (err) {
      console.warn('erro eh este:', err)
      console.log('-----------------------------------')
      console.log('O conteúdo que deu erro:', subject)
    }

    if(subject.area){/*Salva areas se foi passado.*/}
    if(subject.description){/*Salva description se foi passado.*/}
    if(subject.examination){/*Salva examinations se foi passado.*/}
  }

  saveArea(area: Area): void {
    try {
      this.db.prepare(`
      INSERT INTO areas (title)
      VALUES (?)
    `).run(area.title);
    } catch (err) {
      console.warn('erro eh este:', err)
      console.log('-----------------------------------')
      console.log('A area que deu erro:', area)
    }

    if(area.description){/*Salva description se foi passado*/}
    if(area.examination){/*Salva examinações se não foram salvos ainda*/}
  }

  search(query: string): Document[] {
    return this.db.prepare(`
      SELECT * FROM documents
      WHERE content LIKE ?
    `).all(`%${query}%`) as Document[];
  }

findAllBooks(): Book[] {
  const stmt = this.db.prepare(`
    SELECT  
      b.title,
      b.book_id,
      b.edition,
      json_group_array(a.title) as areas,
      b.has_document
    FROM books b
    LEFT JOIN book_area ba ON b.book_id = ba.book_id
    LEFT JOIN areas a ON ba.area_id = a.id
    GROUP BY b.book_id
  `)

  return stmt.all().map((r: any) => ({
    title: r.title,
    bookId: r.book_id,
    edition: r.edition,
    areas: r.areas ? JSON.parse(r.areas) : [],
    hasDocument: r.has_document
  })) as Book[]
}

  verifyQuestion(questionTitle: string): boolean {
    try {
      const stmt = this.db.prepare('SELECT EXISTS(SELECT 1 FROM questions WHERE title = ? LIMIT 1) AS existe');
      const resultado = stmt.get(questionTitle) as { existe: number };
      return resultado.existe === 1;
    } catch(err) {
      console.warn('erro eh este:', err)
      console.log('-----------------------------------')
      console.log('A questao que deu erro:', questionTitle)
      return false;
    }
  }

  clear(): void {
    this.db.exec("DELETE FROM documents");
  }

  resetTable(): void {
    this.db.exec("DROP TABLE IF EXISTS books;")
    this.db.exec("DROP TABLE IF EXISTS chapters;")
    this.db.exec("DROP TABLE IF EXISTS questions;")
    this.db.exec("DROP TABLE IF EXISTS areas;")
    this.db.exec("DROP TABLE IF EXISTS subjects;")
    this.db.exec("DROP TABLE IF EXISTS book_area;")
    this.db.exec("DROP TABLE IF EXISTS subject_area;")
    this.db.exec("DROP TABLE IF EXISTS chapter_subject;")
  }

  check(): void {
    const schema = this.db.prepare("SELECT sql FROM sqlite_master WHERE type='table'").all();
    console.log("tabelas:", JSON.stringify(schema, null, 2))
    this.printTableCounts()
  }

  printTableCounts() {
    const tableNames = this.db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    ).all() as { name: string }[];

    console.log('--- Contagem de Itens por Tabela ---');

    for (const table of tableNames) {
        const tableName = table.name;
        const count = this.db.prepare(`SELECT COUNT(*) as count FROM "${tableName}"`).get() as { count: number };
        
        console.log(`Tabela: ${tableName} | Itens: ${count.count}`);
    }
    console.log('-----------------------------------');
  }

  close(): void {
    this.db.close(); //task: fazer classe receber o .db para melhor arquitetura algum dia
  }
}

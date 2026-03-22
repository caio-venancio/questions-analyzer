// import Database from "better-sqlite3";
// import type { Book } from "../models/document";

// export class BookRepository {
//   constructor(private db: Database) {}

//   findAll(): Book[] {
//     return this.db.prepare(`
//       SELECT id, title, edition, authors
//       FROM books
//     `).all();
//   }

//   findById(id: string): Book | undefined {
//     return this.db.prepare(`
//       SELECT id, title, edition, authors
//       FROM books
//       WHERE id = ?
//     `).get(id);
//   }

//   insert(book: Book) {
//     this.db.prepare(`
//       INSERT INTO books (id, title, edition, authors)
//       VALUES (?, ?, ?, ?)
//     `).run(book.id, book.title, book.edition, JSON.stringify(book.authors));
//   }
// }
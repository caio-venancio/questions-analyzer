import type { Document, Question, Book, Chapter } from "../models/document";
import type { Subject, Area } from "../models/academic"

export interface IndexStore {
  save(doc: Document): void;
  saveQuestion(question: Question): void;
  saveBook(book: Book): void;
  saveChapter(chapter: Chapter): void;
  saveSubject(subject: Subject): void;
  saveArea(area: Area): void;
  search(query: string): Document[];
  findAllBooks(): Book[];
  verifyQuestion(questionTitle: string): boolean 
  
  clear(): void;
  check(): void;
}

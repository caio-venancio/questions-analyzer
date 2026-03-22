export interface Document {
  id: string;
  path: string;
  title: string;
  content: string;
  livro?: string;
  capitulo?: string;
  tipo?: string;
  tags?: string[];
}

export interface Question {
  // path: string;
  title: string;
  question: string;
  answer?: string;
  bookId?: string;
  chapter?: number | null;
  areas?: string[];
  subjects?: string[];
  topic?: string[];
  rank?: number[];
  hasDocument?: number;
}

export interface Book {
  title: string;
  edition?: number;
  bookId?: string;
  authors?: string[];
  chapters?: string[];
  area?: string[];
  subjects?: string[];
  topic?: string[];
  hasDocument?: number;
}

export interface Chapter {
  title: string;
  number: number;
  bookId: string;
  activities?: string[];
  area?: string[];
  subjects?: string[];
  topic?: string[];
  hasDocument?: number;
}

export interface CommonAsked {
  id: string;
  title: string;
  questions?: string[];
  area?: string[];
  subjects?: string[];
  topic?: string[];
  hasDocument?: boolean;
}


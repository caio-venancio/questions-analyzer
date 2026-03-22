import type { IndexStore } from "../index/indexStore";
import type { SearchQuery } from "../models/searchQuery";
import type { SearchResult } from "../models/searchResult";
import type { Book } from "../models/document";

export class SearchService {
  constructor(private index: IndexStore) {}

  search(query: SearchQuery): SearchResult[] {
    if (!query.text) return [];

    return this.index.search(query.text).map(doc => ({
      document: doc
    }));
  }

  getAllBooks(): Book[] {
    
    return this.index.findAllBooks()
  }
}

export interface Article {
  id: string;
  title: string;
  abstract: string;
  year?: number;
}

export interface LiteratureSource {
  search(query: string, limit: number): Promise<Article[]>;
}

export const LITERATURE_SOURCE = 'LITERATURE_SOURCE';

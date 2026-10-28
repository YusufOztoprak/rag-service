import type { Article, LiteratureSource } from './literature-source';
import { XMLParser } from 'fast-xml-parser';

const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

interface RawAbstractPart {
  '#text'?: string;
  '@_Label'?: string;
}

interface RawArticle {
  MedlineCitation: {
    PMID: { '#text': string };
    Article: {
      ArticleTitle: string;
      Abstract?: { AbstractText: (string | RawAbstractPart)[] };
      Journal?: { JournalIssue?: { PubDate?: { Year?: string } } };
    };
  };
}

export class PubMedAdapter implements LiteratureSource {
  async search(query: string, limit: number): Promise<Article[]> {
    const ids = await this.searchIds(query, limit);
    const raw = await this.fetchArticles(ids);

    return raw
      .map((r) => this.toArticle(r))
      .filter((a): a is Article => a !== null);
  }

  private async searchIds(query: string, limit: number): Promise<string[]> {
    const params = new URLSearchParams({
      db: 'pubmed',
      term: query,
      retmax: String(limit),
      retmode: 'json',
    });
    const url = `${BASE_URL}/esearch.fcgi?${params}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PubMed search failed: ${response.status}`);
    }

    const data = await response.json();
    return data.esearchresult.idlist;
  }

  private async fetchArticles(ids: string[]): Promise<RawArticle[]> {
    const params = new URLSearchParams({
      db: 'pubmed',
      id: ids.join(','),
      retmode: 'xml',
    });
    const url = `${BASE_URL}/efetch.fcgi?${params}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PubMed fetch failed: ${response.status}`);
    }

    const xml = await response.text();

    // PubMed uses inline formatting tags like <i>in vivo</i> inside titles and abstracts.
    // Strip them before parsing so the text stays a plain string.
    const cleanXml = xml.replace(/<\/?(i|b|u|sup|sub)>/g, '');

    const parser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: false,
      htmlEntities: true,
      isArray: (name) => name === 'PubmedArticle' || name === 'AbstractText',
    });
    const parsed = parser.parse(cleanXml);

    return parsed.PubmedArticleSet.PubmedArticle;
  }

  private toArticle(raw: RawArticle): Article | null {
    const article = raw.MedlineCitation.Article;
    const parts = article.Abstract?.AbstractText ?? [];

    if (parts.length === 0) {
      return null;
    }

    const abstract = parts
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }
        if (part['@_Label']) {
          return `${part['@_Label']}: ${part['#text']}`;
        }
        return part['#text'] ?? '';
      })
      .join('\n\n');

    const year = article.Journal?.JournalIssue?.PubDate?.Year;

    return {
      id: raw.MedlineCitation.PMID['#text'],
      title: article.ArticleTitle,
      abstract,
      year: year ? Number(year) : undefined,
    };
  }
}

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PubMedAdapter } from './pubmed.adapter';

const fixture = (name: string) =>
  readFileSync(join(__dirname, '__fixtures__', name), 'utf8');

describe('PubMedAdapter', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const body = String(url).includes('esearch')
        ? fixture('esearch.json')
        : fixture('efetch.xml');
      return new Response(body, { status: 200 });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps every PubMed article to an Article', async () => {
    const articles = await new PubMedAdapter().search(
      'aspirin inflammation',
      3,
    );

    expect(articles).toHaveLength(3);
    for (const article of articles) {
      expect(typeof article.title).toBe('string');
      expect(article.abstract).not.toMatch(/&#x/);
    }
  });

  it('joins labelled abstract sections', async () => {
    const [first] = await new PubMedAdapter().search('aspirin inflammation', 3);

    expect(first.abstract).toContain('BACKGROUND:');
    expect(first.abstract).toContain('CONCLUSION:');
    expect(first.abstract).toContain('±');
  });

  it('keeps text inside inline formatting tags', async () => {
    const articles = await new PubMedAdapter().search(
      'aspirin inflammation',
      3,
    );

    expect(articles[1].title).toContain('the in vivo effects');
  });

  it('throws when PubMed returns an error', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response('', { status: 500 }));

    await expect(new PubMedAdapter().search('x', 3)).rejects.toThrow(
      'PubMed search failed: 500',
    );
  });
});

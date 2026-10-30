import type { EmbeddingProvider } from './embedding-provider';

export class CachingEmbeddingProvider implements EmbeddingProvider {
  private readonly cache = new Map<string, number[]>();

  constructor(private readonly inner: EmbeddingProvider) {}

  async embed(text: string): Promise<number[]> {
    const cached = this.cache.get(text);
    if (cached) {
      return cached;
    }
    const vector = await this.inner.embed(text);
    this.cache.set(text, vector);
    return vector;
  }
}
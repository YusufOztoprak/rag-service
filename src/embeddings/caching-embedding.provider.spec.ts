import type { EmbeddingProvider } from './embedding-provider';
import { CachingEmbeddingProvider } from './caching-embedding.provider';

class CountingProvider implements EmbeddingProvider {
  calls = 0;

  async embed(text: string): Promise<number[]> {
    this.calls++;
    return [text.length];
  }
}

describe('CachingEmbeddingProvider', () => {
  it('calls the  inner provider only once for the same text', async () => {
    const inner = new CountingProvider();
    const cached = new CachingEmbeddingProvider(inner);

    const first = await cached.embed('aspirin');
    const second = await cached.embed('aspirin');

    expect(second).toEqual(first);
    expect(inner.calls).toBe(1);
  });

  it('calls the inner provider again for a differen text', async () => {
    const inner = new CountingProvider();
    const cached = new CachingEmbeddingProvider(inner);

    await cached.embed('aspirin');
    await cached.embed('ibuprofen');

    expect(inner.calls).toBe(2);
  });
});

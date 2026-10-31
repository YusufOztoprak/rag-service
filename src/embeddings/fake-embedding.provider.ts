import { EmbeddingProvider } from './embedding-provider';

export class FakeEmbeddingProvider implements EmbeddingProvider {
  readonly model = 'fake';

  async embed(text: string): Promise<number[]> {
    return new Array(1536).fill(0.01);
  }
}

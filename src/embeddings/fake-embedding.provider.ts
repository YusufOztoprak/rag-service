import { EmbeddingProvider } from './embedding-provider';

export class FakeEmbeddingProvider implements EmbeddingProvider {
  async embed(text: string): Promise<number[]> {
    return new Array(1536).fill(0.01);
  }
}

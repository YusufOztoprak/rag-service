export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

export const EMBEDDING_PROVIDER = 'EMBEDDING_PROVIDER';

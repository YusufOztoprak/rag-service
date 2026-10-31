export interface EmbeddingProvider {
  readonly model: string;
  embed(text: string): Promise<number[]>;
}

export const EMBEDDING_PROVIDER = 'EMBEDDING_PROVIDER';

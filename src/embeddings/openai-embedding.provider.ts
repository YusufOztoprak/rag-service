import OpenAI from 'openai';
import { EmbeddingProvider } from './embedding-provider';

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private readonly openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async embed(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }
}

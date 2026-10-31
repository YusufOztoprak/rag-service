import OpenAI from 'openai';
import { EmbeddingProvider } from './embedding-provider';

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private readonly openai: OpenAI;
  readonly model = 'text-embedding-3-small';

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async embed(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: this.model,
      input: text,
    });
    return response.data[0].embedding;
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import {
  type EmbeddingProvider,
  EMBEDDING_PROVIDER,
} from '../embeddings/embedding-provider';
import { LLMService } from '../llm/llm.service';

@Injectable()
export class SearchService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    @Inject(EMBEDDING_PROVIDER) private readonly embedder: EmbeddingProvider,
    private readonly llmService: LLMService,
  ) {}

  async search(question: string, limit: number) {
    const embedding = await this.embedder.embed(question);
    const vectorString = `[${embedding.join(',')}]`;

    const result = await this.pool.query(
      `SELECT id, content, embedding <=> $1 AS distance
       FROM chunks
       ORDER BY embedding <=> $1 ASC
           LIMIT $2`,
      [vectorString, limit],
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result.rows;
  }

  async ask(question: string): Promise<string> {
    const chunks = await this.search(question, 3);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
    const relevant = chunks.filter((c) => c.distance < 0.8);

    if (relevant.length === 0) {
      return "I don't know - no relevant documents found.";
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
    const context = relevant.map((c) => c.content).join('\n\n');

    const prompt = `Answer the question based only on the following context.If the answer is not in the context, say you don't know.

    Context: 
    ${context}

    Question: ${question}`;

    const answer = await this.llmService.generate(prompt);

    return answer;
  }
}

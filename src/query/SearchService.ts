import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import { EmbeddingService } from '../embeddings/embedding.service';
import { LLMService } from '../llm/llm.service';

@Injectable()
export class SearchService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly embeddingService: EmbeddingService,
    private readonly llmService: LLMService,
  ) {}

  async search(question: string, limit: number) {
    const embedding = await this.embeddingService.embed(question);
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
    const context = chunks.map((c) => c.content).join('\n\n');

    const prompt = `Answer the question based only on the following context.If the answer is not in the context, say you don't know.

    Context: 
    ${context}

    Question: ${question}`;

    const answer = await this.llmService.generate(prompt);

    return answer;
  }
}

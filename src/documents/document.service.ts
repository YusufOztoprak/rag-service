import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import { EmbeddingService } from '../embeddings/embedding.service';
import { chunkText } from './chunking';

@Injectable()
export class DocumentService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async ingest(
    filename: string,
    text: string,
  ): Promise<{ documentId: number; chunkCount: number }> {
    // 1. chunk text into pieces of 1000 characters with 200 character overlap
    const chunks = chunkText(text, 1000, 200);

    // 2. Insert document to documents table and get its ID
    const docResult = await this.pool.query(
      'INSERT INTO documents (filename) VALUES ($1) RETURNING id',
      [filename],
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const documentId: number = docResult.rows[0].id;

    // 3. For each chunk, generate embedding and insert into chunks table
    for (const chunk of chunks) {
      const embedding = await this.embeddingService.embed(chunk);
      const vectorString = `[${embedding.join(',')}]`;

      await this.pool.query(
        'INSERT INTO chunks (document_id, content, embedding) VALUES ($1, $2, $3)',
        [documentId, chunk, vectorString],
      );
    }

    return { documentId, chunkCount: chunks.length };
  }
}

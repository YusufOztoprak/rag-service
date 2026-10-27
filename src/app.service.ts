import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      service: 'rag-service',
      description: 'RAG API: NestJS + PostgreSQL/pgvector + OpenAI',
      endpoints: {
        search: '/query/search?q=your+question',
        ask: '/query/ask?q=your+question',
      },
      source: 'https://github.com/YusufOztoprak/rag-service',
    };
  }
}
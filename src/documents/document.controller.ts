import { Controller, Post } from '@nestjs/common';
import { DocumentService } from './document.service';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('test')
  async test() {
    const sampleText =
      'Retrieval-Augmented Generation combines information retrieval with text generation. ' +
      'It retrieves relevant documents from a knowledge base and uses them as context for a language model. ' +
      'This reduces hallucination because the model answers based on real sources instead of only its training data. ' +
      'pgvector is a PostgreSQL extension that stores embeddings and supports similarity search.';

    return this.documentService.ingest('sample.txt', sampleText);
  }
}

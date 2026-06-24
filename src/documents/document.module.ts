import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { EmbeddingModule } from '../embeddings/embedding.module';
import { DocumentController } from './document.controller';

@Module({
  imports: [EmbeddingModule],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}

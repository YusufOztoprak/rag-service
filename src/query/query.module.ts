import { Module } from '@nestjs/common';
import { SearchService } from './SearchService';
import { EmbeddingModule } from '../embeddings/embedding.module';
import { QueryController } from './query.controller';
import { LLMModule } from '../llm/llm.module';

@Module({
  imports: [EmbeddingModule, LLMModule],
  controllers: [QueryController],
  providers: [SearchService],
  exports: [SearchService],
})
export class QueryModule {}

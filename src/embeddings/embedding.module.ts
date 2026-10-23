import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmbeddingProvider, EMBEDDING_PROVIDER } from './embedding-provider';
import { FakeEmbeddingProvider } from './fake-embedding.provider';
import { OpenAIEmbeddingProvider } from './openai-embedding.provider';

@Module({
  providers: [
    {
      provide: EMBEDDING_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): EmbeddingProvider => {
        if (config.get<string>('EMBEDDING_PROVIDER') === 'fake') {
          return new FakeEmbeddingProvider();
        }
        return new OpenAIEmbeddingProvider(
          config.getOrThrow<string>('OPENAI_API_KEY'),
        );
      },
    },
  ],
  exports: [EMBEDDING_PROVIDER],
})
export class EmbeddingModule {}

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmbeddingProvider, EMBEDDING_PROVIDER } from './embedding-provider';
import { FakeEmbeddingProvider } from './fake-embedding.provider';
import { OpenAIEmbeddingProvider } from './openai-embedding.provider';
import { CachingEmbeddingProvider } from './caching-embedding.provider';


@Module({
  providers: [
    {
      provide: EMBEDDING_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): EmbeddingProvider => {
        const base: EmbeddingProvider =
          config.get<string>('EMBEDDING_PROVIDER') === 'fake'
            ? new FakeEmbeddingProvider()
            : new OpenAIEmbeddingProvider(
                config.getOrThrow<string>('OPENAI_API_KEY'),
              );

        return new CachingEmbeddingProvider(base);
      },
    },
  ],
  exports: [EMBEDDING_PROVIDER],
})
export class EmbeddingModule {}

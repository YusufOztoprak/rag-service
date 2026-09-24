import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { EmbeddingModule } from './embeddings/embedding.module';
import { DocumentModule } from './documents/document.module';
import { QueryModule } from './query/query.module';
import { LLMModule } from './llm/llm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<string>('NODE_ENV') === 'production';
        return {
          pinoHttp: {
            level:
              config.get<string>('LOG_LEVEL') ?? (isProd ? 'info' : 'debug'),
            transport: isProd
              ? undefined
              : { target: 'pino-pretty', options: { singleLine: true } },
            genReqId: (req: IncomingMessage, res: ServerResponse) => {
              const existing = req.headers['x-request-id'];
              const id =
                typeof existing === 'string' && existing
                  ? existing
                  : randomUUID();
              res.setHeader('X-Request-ID', id);
              return id;
            },
            serializers: {
              req: (req: { id: string; method: string; url: string }) => ({
                id: req.id,
                method: req.method,
                url: req.url,
              }),
              res: (res: { statusCode: number }) => ({
                statusCode: res.statusCode,
              }),
            },
            redact: ['req.headers.authorization'],
            customLogLevel: (_req, res, err) =>
              err || res.statusCode >= 500
                ? 'error'
                : res.statusCode >= 400
                  ? 'warn'
                  : 'info',
          },
        };
      },
    }),
    DatabaseModule,
    EmbeddingModule,
    DocumentModule,
    QueryModule,
    LLMModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

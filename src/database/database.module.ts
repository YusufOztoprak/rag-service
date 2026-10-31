import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const PG_POOL = 'PG_POOL';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const pool = new Pool({
          connectionString: configService.get<string>('DATABASE_URL'),
          // Close idle connections before Neon suspends and drops them
          idleTimeoutMillis: 30_000,
          connectionTimeoutMillis: 10_000,
          keepAlive: true,
        });

        // An idle connection dropped by the server must not crash the app
        pool.on('error', (err) => {
          console.error('Idle database connection error:', err.message);
        });
        return pool;
        },
      },
    ],
    exports: [PG_POOL],
  })

export class DatabaseModule {}

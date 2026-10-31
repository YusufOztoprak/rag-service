ALTER TABLE chunks
    ADD COLUMN IF NOT EXISTS embedding_model TEXT NOT NULL DEFAULT 'text-embedding-3-small';

ALTER TABLE chunks
    ALTER COLUMN embedding_model DROP DEFAULT;
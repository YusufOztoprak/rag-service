# RAG Service

A production-style **Retrieval-Augmented Generation (RAG)** API built with NestJS, PostgreSQL + pgvector, and OpenAI. Upload-ready document text is chunked, embedded, and stored as vectors; incoming questions are embedded, matched against the most semantically similar chunks, and answered by an LLM **grounded only in the retrieved context** to reduce hallucination.

🔗 **Live demo:** https://rag-service-q8p3.onrender.com
*(Hosted on Render's free tier — the first request may take ~50s while the instance wakes up.)*

---

## What it does

RAG lets a language model answer questions using **your own documents** instead of relying solely on its training data. This service implements the full pipeline end to end.

**1. Indexing (when content is added)**
```
text → split into overlapping chunks → embed each chunk (OpenAI) → store chunk + vector in pgvector
```

**2. Querying (when a question is asked)**
```
question → embed → find nearest chunks in pgvector (cosine distance) → build context → LLM answers using only that context
```

The LLM is explicitly instructed to answer **only from the retrieved context** and to say it doesn't know when the answer isn't present — this is what keeps responses grounded and reduces hallucination.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | NestJS (TypeScript) |
| Database | PostgreSQL 16 + [pgvector](https://github.com/pgvector/pgvector) |
| Embeddings | OpenAI `text-embedding-3-small` (1536 dimensions) |
| LLM | OpenAI `gpt-4o-mini` |
| Containerization | Docker / docker-compose (local PostgreSQL) |
| Deployment | Render (Web Service + managed PostgreSQL) |

---

## Architecture

The codebase is organized into focused NestJS modules with clear separation of concerns:

```
src/
├── database/      # pgvector connection pool (pg) provided globally
├── embeddings/    # OpenAI embedding wrapper (text → 1536-dim vector)
├── llm/           # OpenAI chat wrapper (prompt → grounded answer)
├── documents/     # chunking logic + ingestion (text → chunks → vectors)
└── query/         # similarity search + RAG ask flow
```

**Key design decisions**
- **Single store:** vectors live in PostgreSQL via pgvector rather than a separate vector DB — one transactional store, simpler ops, and the relational features stay available.
- **Chunking with overlap:** long text is split into fixed-size chunks with overlap so a relevant passage is never lost on a chunk boundary, and each chunk represents one focused topic for more precise retrieval.
- **Parameterized SQL:** all queries use bound parameters (`$1`, `$2`) to prevent SQL injection.
- **Vector format conversion:** OpenAI returns a JS `number[]`, which is converted to pgvector's `[..]` string format before insertion.

---

## API

### `POST /documents/test`
Ingests a built-in sample document (chunks → embeddings → stored). Returns the created document id and chunk count.
```json
{ "documentId": 1, "chunkCount": 1 }
```

### `GET /query/search?q=<question>`
Returns the most similar chunks to the question, with their cosine distance.

### `GET /query/ask?q=<question>`
Full RAG flow: retrieves relevant chunks and returns an LLM answer grounded in them.
```json
{
  "question": "what is pgvector and how does it relate to RAG",
  "answer": "pgvector is a PostgreSQL extension that stores embeddings and supports similarity search. It relates to RAG by ..."
}
```

---

## Database schema

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chunks (
    id SERIAL PRIMARY KEY,
    document_id INT REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

The document metadata and its chunks are separated: a document is embedded as its chunks, not as a whole, so the `embedding` column lives on `chunks`. `ON DELETE CASCADE` removes a document's chunks when the document is deleted.

---

## Running locally

**Prerequisites:** Node.js 18+, Docker, an OpenAI API key.

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL + pgvector
docker compose up -d

# 3. Run the schema migration
docker exec -i rag-postgres psql -U rag_user -d rag_db < migrations/001_init.sql

# 4. Create a .env file
#    DATABASE_URL=postgresql://rag_user:rag_password@localhost:5433/rag_db
#    OPENAI_API_KEY=your_key_here

# 5. Start in watch mode
npm run start:dev
```

Then ingest the sample and ask a question:
```bash
curl -X POST http://localhost:3000/documents/test
curl "http://localhost:3000/query/ask?q=what is pgvector"
```

## Tests

```bash
npm run test
```
Unit tests cover the chunking logic (chunk sizing, overlap behavior, guard clauses, empty input).

---

## Roadmap

- [ ] **PDF upload** — accept real PDF files (multer + pdf-parse) instead of the built-in sample text
- [ ] HNSW index on the `embedding` column for faster approximate nearest-neighbor search at scale
- [ ] System prompt + citations (return which chunks the answer was based on)
- [ ] Multi-document / multi-collection support with auth
- [ ] Dependency audit and hardening (`npm audit`)

---

## License

MIT

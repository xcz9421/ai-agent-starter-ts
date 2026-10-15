# AI Agent Starter (Node / TypeScript)

This repository is a minimal starter for building Retrieval-Augmented Generation (RAG) agents in Node/TypeScript using LangChain.js, OpenAI embeddings, and Pinecone as the vector store. It is optimized for learning and research: you can run it locally, index a few documents, and experiment with an agent that answers questions using indexed knowledge.

Repository contents
- package.json, tsconfig.json — project configuration
- .env.example — environment variables and secrets instructions
- src/ingest.ts — simple ingest script (local markdown + GitHub Releases example hooks)
- src/agent.ts — RAG + simple agent wrapper using LangChain.js
- src/server.ts — Express HTTP API (/chat) to query the agent
- src/utils/logger.ts — lightweight request/operation logger
- data/sample_release.md — sample document included for quick start

Quick start
1. Clone the repo (already created in your account) and install dependencies
   git clone https://github.com/xcz9421/ai-agent-starter-ts.git
   cd ai-agent-starter-ts
   npm install

2. Copy .env.example to .env and fill values for OPENAI_API_KEY and Pinecone keys
   cp .env.example .env
   # Edit .env with your keys

3. Put a couple of markdown files into the data/ folder or keep the provided sample

4. Run the ingest step to index local docs to Pinecone
   npm run ingest

5. Start the server
   npm start

6. POST to /chat with JSON { "question": "your question" } to get an answer

Secrets & GitHub Actions (how to store secrets safely)
- Local development: keep secrets in a local .env file never committed to git. This repo contains .env.example only.
- GitHub Actions (if you add workflows later):
  1. Go to your repository → Settings → Secrets and variables → Actions → New repository secret
  2. Add OPENAI_API_KEY, PINECONE_API_KEY, PINECONE_ENVIRONMENT, PINECONE_INDEX_NAME
  3. In workflows, reference as: ${{ secrets.OPENAI_API_KEY }}

Notes about switching vector stores
- This starter uses Pinecone by default. To switch to Supabase (pgvector) or Weaviate, the ingest/agent code needs a small adapter change. See comments in src/ingest.ts and src/agent.ts for pointers.

Learning & research path (4-week plan)
Week 1 — Foundations & prototype
- Learn LangChain.js basics: chains, retrievers, tools, agents.
- Run this starter: index data, call /chat, inspect results.
- Exercises: add README of a small project to data/ and query it.

Week 2 — Indexing, chunking & metadata
- Improve chunking strategy: keep semantic chunks, tune max tokens per chunk.
- Add metadata to docs (source, version, release date) and implement filtering in retriever.
- Exercises: ingest GitHub release notes and query per-version questions.

Week 3 — Tools & multi-step planning
- Add tools (web search, HTTP API call, simulated shell), implement a plan-and-execute agent.
- Add safety: tool white-list, dry-run mode for shell, input/output validation.
- Exercises: create an agent that decomposes "Update dependency X to latest" into steps and returns a plan.

Week 4 — Evaluation & deployment
- Build evaluation harness: store question/answer pairs, compute precision/recall and human ratings.
- Add logging & provenance: ensure every answer includes source links and chunk excerpts.
- Exercises: run adversarial prompts, collect failures, iterate on prompt engineering and retrieval.

Where to go next
- Replace OpenAI embeddings with a local embedding model (if privacy is required).
- Add a memory layer (conversation buffer, long-term memory via vector DB).
- Implement RLHF or automated feedback loops for answer quality improvement.

License
MIT

If you want, I will now push the starter code and README into the repository (including the sample data file). I will not add CI or automated workflows per your request.
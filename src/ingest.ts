import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from 'langchain/vectorstores/pinecone';

// Simple ingest script: reads local markdown files from data/ and indexes into Pinecone
// Also includes a small helper to fetch GitHub Releases bodies (commented) — you can enable and adapt it.

async function ingestLocal() {
  const openaiKey = process.env.OPENAI_API_KEY;
  const pineKey = process.env.PINECONE_API_KEY;
  const pineEnv = process.env.PINECONE_ENVIRONMENT;
  const indexName = process.env.PINECONE_INDEX_NAME || 'ai-agent-index';

  if (!openaiKey) throw new Error('OPENAI_API_KEY is required');
  if (!pineKey) throw new Error('PINECONE_API_KEY is required');

  const embeddings = new OpenAIEmbeddings({ openAIApiKey: openaiKey });

  const pinecone = new PineconeClient();
  await pinecone.init({ apiKey: pineKey, environment: pineEnv });
  const index = pinecone.Index(indexName);

  const dataDir = path.resolve('data');
  if (!fs.existsSync(dataDir)) {
    console.log('data/ directory does not exist — creating and adding sample file');
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(path.join(dataDir, 'sample_release.md'), '# Sample release\n\nThis is a sample release note used for the starter.');
  }

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.md'));
  const docs: { id: string; text: string; metadata: any }[] = [];

  for (const f of files) {
    const text = fs.readFileSync(path.join(dataDir, f), 'utf8');
    // naive chunking by paragraph: production code should use a tokenizer-aware chunker
    const chunks = text.split(/\n\s*\n/).filter(Boolean);
    for (const [i, chunk] of chunks.entries()) {
      docs.push({ id: `${f}::${i}`, text: chunk, metadata: { source: `local/${f}`, chunkIndex: i } });
    }
  }

  // Convert docs into the simple shape expected by PineconeStore
  const documents = docs.map(d => ({ pageContent: d.text, metadata: d.metadata }));

  // Create / upsert via PineconeStore helper in LangChain
  await PineconeStore.fromDocuments(documents, embeddings, { pineconeIndex: index, namespace: 'agent' });

  console.log('Indexed', documents.length, 'chunks to Pinecone index', indexName);
}

ingestLocal().catch(err => {
  console.error('Ingest error:', err);
  process.exit(1);
});

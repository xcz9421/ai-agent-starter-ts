import 'dotenv/config';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { RetrievalQAChain } from 'langchain/chains';

let qaChain: any = null;

export async function initAgent() {
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

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, { pineconeIndex: index, namespace: 'agent' });

  const chat = new ChatOpenAI({ temperature: 0.0, openAIApiKey: openaiKey });

  qaChain = new RetrievalQAChain({ retriever: vectorStore.asRetriever(5), llm: chat });
}

export async function answer(question: string) {
  if (!qaChain) await initAgent();
  const res = await qaChain.call({ query: question });
  // RetrievalQAChain may return { text } or { output_text } depending on version of LangChain
  return res?.text ?? res?.output_text ?? res;
}

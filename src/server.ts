import express from 'express';
import 'dotenv/config';
import { initAgent, answer } from './agent';
import { log } from './utils/logger';

const app = express();
app.use(express.json());

app.post('/chat', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'question is required' });

  try {
    log('request', { question });
    const a = await answer(question);
    log('response', { question, answer: typeof a === 'string' ? a.slice(0, 400) : JSON.stringify(a).slice(0, 400) });
    res.json({ answer: a });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

const port = process.env.PORT || 3000;
initAgent().then(() => {
  app.listen(port, () => console.log(`Server listening on ${port}`));
}).catch(err => {
  console.error('Agent init failed:', err);
  process.exit(1);
});

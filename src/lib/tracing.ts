import { Langfuse } from 'langfuse';

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY || process.env.LANGFUSE_API_KEY || '',
  secretKey: process.env.LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com',
});

export default langfuse;
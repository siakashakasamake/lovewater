import { store } from '../lib/cms.mjs';
// GET /api/img/<nome> → foto caricata dal pannello
export default async (req) => {
  const key = new URL(req.url).pathname.split('/').pop();
  if (!/^[a-z0-9]+\.(jpg|png|webp)$/.test(key)) return new Response('Not found', { status: 404 });
  const r = await store().getWithMetadata('img/' + key, { type: 'arrayBuffer' });
  if (!r) return new Response('Not found', { status: 404 });
  return new Response(r.data, { headers: { 'content-type': r.metadata?.type || 'image/jpeg', 'cache-control': 'public, max-age=31536000, immutable' } });
};
export const config = { path: '/api/img/*' };

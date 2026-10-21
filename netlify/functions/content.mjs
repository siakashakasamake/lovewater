import { store, authed, json, deny, saveVersion } from '../lib/cms.mjs';
// GET: contenuti pubblici del sito · POST: salvataggio dal pannello
export default async (req) => {
  const s = store();
  if (req.method === 'GET') {
    const c = (await s.get('content', { type: 'json' })) || {};
    return json(c, 200, { 'cache-control': 'public, max-age=0, must-revalidate' });
  }
  if (req.method !== 'POST') return json({ error: 'Metodo non consentito' }, 405);
  if (!authed(req)) return deny();
  let body; try { body = await req.json(); } catch { return json({ error: 'Dati non validi' }, 400); }
  const next = body && body.content;
  if (!next || typeof next !== 'object') return json({ error: 'Dati non validi' }, 400);
  if (JSON.stringify(next).length > 2_000_000) return json({ error: 'Contenuto troppo grande' }, 413);
  next.updated = new Date().toISOString();
  await s.setJSON('content', next);
  await saveVersion(s, next, body.label);
  return json({ ok: true, updated: next.updated });
};
export const config = { path: '/api/content' };

import { store, authed, json, deny, saveVersion } from '../lib/cms.mjs';
// GET: elenco versioni · POST {id}: ripristina una versione
export default async (req) => {
  if (!authed(req)) return deny();
  const s = store();
  if (req.method === 'GET') return json((await s.get('hist/index', { type: 'json' })) || []);
  if (req.method !== 'POST') return json({ error: 'Metodo non consentito' }, 405);
  const { id } = await req.json().catch(() => ({}));
  const index = (await s.get('hist/index', { type: 'json' })) || [];
  const v = index.find((x) => x.id === id);
  if (!v) return json({ error: 'Versione non trovata' }, 404);
  const snap = await s.get('hist/' + id, { type: 'json' });
  if (!snap) return json({ error: 'Versione non trovata' }, 404);
  snap.updated = new Date().toISOString();
  await s.setJSON('content', snap);
  const d = new Date(v.ts).toLocaleString('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  await saveVersion(s, snap, 'Ripristino della versione del ' + d);
  return json({ ok: true, content: snap });
};
export const config = { path: '/api/history' };

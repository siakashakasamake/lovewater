import { store, authed, json, deny } from '../lib/cms.mjs';
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
// POST {type, data(base64)} → {url}
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Metodo non consentito' }, 405);
  if (!authed(req)) return deny();
  const { type, data } = await req.json().catch(() => ({}));
  if (!TYPES[type] || typeof data !== 'string') return json({ error: 'Formato non supportato: usa JPG, PNG o WEBP' }, 400);
  const buf = Buffer.from(data, 'base64');
  if (buf.length > 4_500_000) return json({ error: 'Foto troppo pesante' }, 413);
  const key = Date.now().toString(36) + Math.random().toString(36).slice(2, 8) + '.' + TYPES[type];
  await store().set('img/' + key, buf, { metadata: { type } });
  return json({ ok: true, url: '/api/img/' + key });
};
export const config = { path: '/api/upload' };

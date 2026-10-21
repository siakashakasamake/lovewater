import { getStore } from '@netlify/blobs';
export const store = () => getStore({ name: 'lovewater-cms', consistency: 'strong' });
const PASS = () => (globalThis.Netlify?.env?.get('ADMIN_PASSWORD')) || process.env.ADMIN_PASSWORD || '';
export function authed(req) {
  const p = PASS(); const k = req.headers.get('x-admin-key') || '';
  return !!p && k.length === p.length && k === p;
}
export const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra } });
export const deny = () => json({ error: 'Password non valida' }, 401);
const MAX_VERSIONS = 40;
export async function saveVersion(s, content, label) {
  const index = (await s.get('hist/index', { type: 'json' })) || [];
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  await s.setJSON('hist/' + id, content || {});
  index.unshift({ id, ts: new Date().toISOString(), label: String(label || 'Modifica').slice(0, 80) });
  for (const old of index.splice(MAX_VERSIONS)) await s.delete('hist/' + old.id);
  await s.setJSON('hist/index', index);
  return id;
}

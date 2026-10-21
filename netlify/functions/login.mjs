import { authed, json, deny } from '../lib/cms.mjs';
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Metodo non consentito' }, 405);
  return authed(req) ? json({ ok: true }) : deny();
};
export const config = { path: '/api/login' };

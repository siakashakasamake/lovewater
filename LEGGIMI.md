# Sito Lovewater · We Love Water

Sito multipagina con pannello di gestione (Netlify Functions + Netlify Blobs).

## Pubblicazione
1. Carica tutto il contenuto di questa cartella in un repository GitHub (la radice del repo deve contenere `index.html` e `netlify.toml`).
2. Su Netlify: Add new project → Import an existing project → GitHub → scegli il repository.
   Build command: vuoto · Publish directory: `.` (già impostati in `netlify.toml`).
3. Site configuration → Environment variables → aggiungi `ADMIN_PASSWORD` con la password del pannello.
4. Rilancia il deploy (Deploys → Trigger deploy) dopo aver impostato la password.

## Pannello
- Indirizzo: `https://<dominio>/admin`
- Testi, foto, prodotti, FAQ, contatti, orari, social e versioni salvate.
- I contenuti modificati sono salvati in Netlify Blobs (store `lovewater-cms`), le foto caricate anche.

## Da completare
- Dominio definitivo: aggiornare canonical, sitemap e robots (oggi `www.welovewater.it`).
- Conferma P. IVA nel piè di pagina e indirizzo (Google Maps indica SP654R, 5).

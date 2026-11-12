# Il Forno — sito e dashboard

Next.js 16 (App Router, Cache Components) · Tailwind 4 · Supabase (DB, login, realtime, foto) · Resend (email) · Twilio (SMS).

## Avvio

1. Crea un progetto gratuito su [supabase.com](https://supabase.com).
2. SQL Editor → incolla ed esegui `supabase/schema.sql` (tabelle, permessi, realtime, prodotti di esempio).
3. Copia `.env.example` in `.env.local` e inserisci le chiavi (Project Settings → API).
4. Authentication → Users → crea gli utenti di Marco e Anna, poi in SQL Editor:
   ```sql
   insert into public.staff (user_id) select id from auth.users where email in ('marco@…', 'anna@…');
   ```
5. `pnpm install && pnpm dev` → http://localhost:3000

## Pagine

| URL | Cosa |
|---|---|
| `/it`, `/en` | Home: video, chi siamo, chicche della settimana, categorie, recensioni, dove siamo |
| `/it/shop` | Catalogo con carrello |
| `/it/checkout` | Ordine con ritiro in negozio (ospite o registrato), pagamento al ritiro |
| `/it/account` | Login / registrazione cliente e storico ordini |
| `/it/dashboard` | Solo staff: ordini in tempo reale, gestione prodotti, andamento |

## Da sostituire con i materiali veri

- **Video home**: già inserito in `public/video/` (`hero.webm`, `hero.mp4`, `hero-poster.jpg`). Per cambiarlo:
  ```bash
  ffmpeg -i nuovo.mov -an -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart hero.mp4
  ffmpeg -i nuovo.mov -an -c:v libvpx-vp9 -crf 36 -b:v 0 hero.webm
  ffmpeg -ss 12 -i nuovo.mov -frames:v 1 -q:v 4 hero-poster.jpg
  ```
- **Logo**: componente `Logo` in `src/components/header.tsx`.
- **Foto prodotti**: si caricano dalla dashboard (Prodotti → modifica → Foto).
- **Foto di Marco e Anna**, indirizzo, telefono, Instagram, orari, recensioni: `src/app/[lang]/page.tsx` e `src/lib/i18n.ts`.

## Regole ordini

In `src/lib/orders.ts` (test: `pnpm test`): stesso giorno ok per piccole quantità; prodotti "su ordinazione" o più di 20 pezzi richiedono almeno il giorno dopo. Prezzi e regole sono verificati sul server.

## Notifiche

Il cliente riceve un messaggio quando l'ordine passa a *In preparazione* (presa in carico), *Pronto* o *Annullato*: email se l'ha inserita, altrimenti SMS. Senza chiavi Resend/Twilio i messaggi vengono solo scritti nel log del server.

## Deploy

Vercel: importa il repository, aggiungi le stesse variabili di `.env.local`, collega il dominio.

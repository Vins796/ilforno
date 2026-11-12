-- Il Forno — schema Supabase. Eseguire una volta nel SQL Editor del progetto.

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name_it text not null,
  name_en text not null,
  description_it text not null default '',
  description_en text not null default '',
  category text not null check (category in ('pane','focacce','dolci','torte','stagionali')),
  price_cents integer not null check (price_cents >= 0),
  unit_it text not null default 'pz',
  unit_en text not null default 'pc',
  image_url text,
  available boolean not null default true,
  weekly_special boolean not null default false,
  requires_advance boolean not null default false, -- es. torte: almeno 1 giorno prima
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.staff (
  user_id uuid primary key references auth.users on delete cascade
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity,
  user_id uuid references auth.users on delete set null,
  customer_name text not null,
  email text,
  phone text,
  pickup_at timestamptz not null,
  notes text not null default '',
  lang text not null default 'it' check (lang in ('it','en')),
  status text not null default 'received'
    check (status in ('received','preparing','ready','picked_up','cancelled')),
  total_cents integer not null,
  created_at timestamptz not null default now(),
  check (email is not null or phone is not null)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  product_id uuid references public.products on delete set null,
  name text not null,           -- copia del nome al momento dell'ordine
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0)
);

create index on public.orders (created_at desc);
create index on public.order_items (order_id);

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff where user_id = auth.uid())
$$;

alter table public.products enable row level security;
alter table public.staff enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "catalogo pubblico" on public.products for select using (true);
create policy "staff gestisce prodotti" on public.products for all
  using (public.is_staff()) with check (public.is_staff());

create policy "staff vede se stesso" on public.staff for select using (user_id = auth.uid());

-- Gli ordini vengono creati solo dal server (service role) dopo la validazione dei prezzi.
create policy "cliente vede i suoi ordini" on public.orders for select
  using (user_id = auth.uid() or public.is_staff());
create policy "staff aggiorna ordini" on public.orders for update
  using (public.is_staff()) with check (public.is_staff());

create policy "righe visibili con l'ordine" on public.order_items for select
  using (exists (select 1 from public.orders o
                 where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));

-- Ordini in tempo reale per la dashboard
alter publication supabase_realtime add table public.orders;

-- Foto prodotti
insert into storage.buckets (id, name, public) values ('products', 'products', true)
  on conflict (id) do nothing;
create policy "staff carica foto" on storage.objects for insert
  with check (bucket_id = 'products' and public.is_staff());
create policy "staff modifica foto" on storage.objects for update
  using (bucket_id = 'products' and public.is_staff());
create policy "staff elimina foto" on storage.objects for delete
  using (bucket_id = 'products' and public.is_staff());

-- Prodotti di esempio (modificabili dalla dashboard)
insert into public.products (name_it, name_en, description_it, description_en, category, price_cents, unit_it, unit_en, weekly_special, requires_advance, sort) values
  ('Pagnotta di grano antico', 'Ancient grain loaf', 'Lievito madre, 24 ore di lievitazione.', 'Sourdough, 24-hour rise.', 'pane', 450, 'kg', 'kg', false, false, 1),
  ('Grissini stirati', 'Hand-stretched grissini', 'Il classico torinese, tirati a mano.', 'The Turin classic, stretched by hand.', 'pane', 300, 'etto', '100 g', false, false, 2),
  ('Biova', 'Biova', 'Il pane piemontese di tutti i giorni.', 'Piedmont''s everyday bread.', 'pane', 380, 'kg', 'kg', false, false, 3),
  ('Focaccia genovese', 'Focaccia', 'Olio extravergine e sale grosso.', 'Extra-virgin olive oil and coarse salt.', 'focacce', 1400, 'kg', 'kg', false, false, 4),
  ('Focaccia con cipolle', 'Onion focaccia', 'Cipolle dorate e rosmarino.', 'Golden onions and rosemary.', 'focacce', 1600, 'kg', 'kg', true, false, 5),
  ('Paste di meliga', 'Paste di meliga cookies', 'Biscotti di farina di mais, ricetta tradizionale.', 'Traditional cornmeal cookies.', 'dolci', 2400, 'kg', 'kg', false, false, 6),
  ('Bunet', 'Bunet', 'Budino piemontese al cacao e amaretti.', 'Piedmontese cocoa and amaretti pudding.', 'dolci', 350, 'pz', 'pc', true, false, 7),
  ('Torta di nocciole', 'Hazelnut cake', 'Nocciole Piemonte IGP. Su ordinazione.', 'Piedmont PGI hazelnuts. Made to order.', 'torte', 2200, 'pz', 'pc', false, true, 8),
  ('Torta della nonna', 'Grandma''s custard tart', 'Crema pasticcera e pinoli. Su ordinazione.', 'Custard and pine nuts. Made to order.', 'torte', 2500, 'pz', 'pc', false, true, 9),
  ('Panettone artigianale', 'Artisan panettone', 'Disponibile nel periodo natalizio.', 'Available during the Christmas season.', 'stagionali', 3200, 'kg', 'kg', false, true, 10);

-- Dopo aver creato gli account di Marco e Anna (Authentication → Users):
-- insert into public.staff (user_id) select id from auth.users where email in ('marco@...', 'anna@...');

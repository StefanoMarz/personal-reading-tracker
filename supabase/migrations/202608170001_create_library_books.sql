-- Prima migrazione del backend del Personal Reading Tracker.
-- Una migrazione e un file che descrive in modo ripetibile una modifica al database.

create table public.library_books (
  -- UUID: identificatore univoco generato dal database per ogni riga.
  id uuid primary key default gen_random_uuid(),

  -- Collega il libro all'utente autenticato di Supabase.
  -- Se l'account viene eliminato, vengono eliminati anche i suoi libri.
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Manteniamo l'identificatore originale per riconoscere lo stesso libro
  -- quando ricompare in una nuova ricerca su Open Library.
  open_library_id text not null,

  -- Copia essenziale dei metadati ricevuti da Open Library. In questo modo
  -- la libreria salvata puo essere mostrata senza ripetere ogni volta la ricerca.
  title text not null,
  author text not null,
  publication_year integer,
  publisher text,
  cover_url text,
  pages integer,

  -- NULL corrisponde a "No status" nell'interfaccia React.
  status text check (
    status is null
    or status in ('want to read', 'reading', 'read')
  ),
  is_favorite boolean not null default false,
  rating smallint not null default 0 check (rating between 0 and 5),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Lo stesso utente non puo salvare due volte lo stesso libro.
  constraint library_books_user_book_unique
    unique (user_id, open_library_id),

  -- Conserviamo solo libri che hanno almeno uno stato o sono preferiti,
  -- come gia avviene nel localStorage dell'applicazione.
  constraint library_books_has_personal_data
    check (status is not null or is_favorite),

  -- Un voto e valido soltanto quando il libro risulta letto.
  constraint library_books_rating_requires_read_status
    check (rating = 0 or status = 'read')
);

-- Aggiorna automaticamente updated_at a ogni modifica della riga.
create or replace function public.set_library_book_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_library_book_updated_at
before update on public.library_books
for each row
execute function public.set_library_book_updated_at();

-- RLS (Row Level Security) fa applicare la sicurezza direttamente al database.
-- Anche se qualcuno prova a chiamare le API fuori dall'interfaccia React,
-- potra lavorare soltanto sulle righe associate al proprio account.
alter table public.library_books enable row level security;

-- L'esposizione automatica delle nuove tabelle resta disattivata nel progetto.
-- Concediamo quindi in modo esplicito le sole operazioni necessarie agli utenti
-- autenticati. Gli utenti anonimi non possono raggiungere questa tabella.
grant select, insert, update, delete
on table public.library_books
to authenticated;

create policy "Users can read their own library books"
on public.library_books
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can add their own library books"
on public.library_books
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own library books"
on public.library_books
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own library books"
on public.library_books
for delete
to authenticated
using ((select auth.uid()) = user_id);

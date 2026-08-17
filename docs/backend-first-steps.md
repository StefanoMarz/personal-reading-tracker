# Backend: primi concetti e primi passi

## Supabase in una frase

Supabase e un servizio che mette a disposizione un database PostgreSQL, utenti,
API e regole di sicurezza senza obbligarci a costruire subito un server completo.

Non sostituisce React: React resta l'interfaccia, mentre Supabase conserva i dati.

## Il percorso di un dato

Quando un utente imposta un libro come `reading`, il flusso sara questo:

1. il componente React intercetta il click;
2. il client Supabase invia una richiesta;
3. Supabase verifica l'identita dell'utente;
4. una policy RLS controlla che la riga appartenga a quell'utente;
5. PostgreSQL aggiorna la riga;
6. React riceve il risultato e aggiorna l'interfaccia.

La ricerca continuera invece a usare Open Library. Separiamo quindi:

- dati pubblici dei libri: Open Library;
- dati personali dell'utente: Supabase.

## Vocabolario minimo

- **Database**: insieme organizzato di dati persistenti.
- **Tabella**: raccolta di elementi dello stesso tipo, simile a un foglio Excel.
- **Riga**: un elemento della tabella, nel nostro caso un libro salvato.
- **Colonna**: una proprieta, per esempio `title`, `rating` o `user_id`.
- **Chiave primaria**: identificatore univoco di una riga.
- **Chiave esterna**: collegamento tra una riga e un'altra tabella.
- **Query**: richiesta per leggere o modificare dati.
- **CRUD**: Create, Read, Update e Delete.
- **Migrazione**: file SQL versionato che descrive una modifica al database.
- **RLS**: regole applicate dal database per limitare le righe accessibili.

## Cosa e stato preparato nel repository

- `.env.example` mostra i nomi delle variabili necessarie senza contenere segreti;
- `supabase/migrations/202608170001_create_library_books.sql` crea la prima tabella;
- `.gitignore` impedisce di pubblicare per errore le variabili locali reali.

Il file SQL contiene commenti didattici. La tabella mantiene le stesse regole gia
presenti nell'app: voto da 0 a 5, voto consentito solo per i libri letti e preferito
indipendente dallo stato di lettura.

## Prossimo passo guidato

1. Creare un account e un progetto dal dashboard di Supabase.
2. Aprire il **SQL Editor** del progetto.
3. Eseguire il contenuto della prima migrazione.
4. Controllare nel **Table Editor** che esista `library_books`.
5. Recuperare URL e publishable key dalle impostazioni API.
6. Copiare `.env.example` in `.env.local` e inserire i due valori reali.

La **publishable key** e progettata per essere usata nel browser. Non bisogna invece
inserire nel frontend una secret key o una service-role key, perche ignorerebbe le
normali protezioni pensate per gli utenti dell'app.

Solo dopo questa verifica installeremo `@supabase/supabase-js` e realizzeremo il
primo collegamento da React. In questo modo ogni passaggio resta piccolo e testabile.

## Secondo traguardo: autenticazione

Il client Supabase e ora configurato e l'applicazione offre due modalita:

- ospite: la libreria continua a essere salvata nel `localStorage`;
- utente registrato: Supabase conserva e ripristina la sessione di accesso.

Prima di provare la conferma email in locale, nel dashboard Supabase aprire
**Authentication > URL Configuration** e configurare:

```text
Site URL: http://localhost:5173
Redirect URL: http://localhost:5173/**
```

La Redirect URL e una lista di indirizzi autorizzati: Supabase non deve inviare
la sessione dell'utente verso un sito scelto liberamente da una richiesta esterna.
Quando pubblicheremo l'app aggiungeremo l'indirizzo di produzione e useremo quello
come Site URL principale.

## Terzo traguardo: persistenza per account

La libreria usa ora due strategie separate:

- ospite: lettura e scrittura nel `localStorage`;
- account: operazioni CRUD sulla tabella `library_books` attraverso Supabase.

Al login la libreria remota sostituisce quella visualizzata, ma la copia ospite
non viene sovrascritta. Se esistono libri locali, la sidebar propone un'importazione.
Durante l'unione, i dati gia presenti nell'account hanno la precedenza; i preferiti
vengono uniti e i dati ospite completano solo quelli personali mancanti.

L'applicazione mostra inoltre caricamento, errori di sincronizzazione e un comando
per riprovare. Le regole principali sono protette da test automatici eseguiti con
Vitest e React Testing Library.

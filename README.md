# Personal Reading Tracker

Personal Reading Tracker è una web app sviluppata con React, TypeScript, Tailwind CSS e Vite.

L’app permette di cercare libri tramite la Open Library API, visualizzare i risultati in card, assegnare uno stato di lettura, valutare i libri completati e salvare i preferiti in una libreria personale persistente.

Il progetto è stato realizzato come applicazione portfolio per consolidare i principali concetti di React, TypeScript e frontend development attraverso una piccola applicazione completa e realistica.

## Funzionalità

* Ricerca di libri per titolo o autore
* Recupero di dati reali tramite Open Library API
* Visualizzazione dei risultati in card responsive
* Informazioni mostrate per ogni libro:

  * copertina
  * titolo
  * autore
  * anno di pubblicazione
  * editore
  * numero di pagine
  
* Gestione dello stato di lettura:

  * Want to read
  * Reading
  * Read
* Sistema di valutazione da 1 a 5 stelle
* Rating disponibile solo per i libri con stato `Read`
* Possibilità di aggiungere o rimuovere libri dai preferiti
* Libreria personale separata dai risultati di ricerca
* Persistenza della libreria tramite `localStorage`
* Ripristino automatico di stato, preferiti e rating nei risultati già salvati
* Sidebar “My Library” con sezioni dedicate:

  * Want to read
  * Reading
  * Read
  * Favourites
* Sezioni apribili e richiudibili tramite accordion
* Rimozione dei singoli libri dalle sezioni
* Reset completo della libreria
* Carousel di libri consigliati recuperati dalla Open Library API
* Scorrimento automatico del carousel
* Navigazione manuale tramite frecce laterali
* Pausa automatica del carousel al passaggio del mouse
* Ricerca automatica cliccando su un libro consigliato
* Interfaccia responsive realizzata con Tailwind CSS

## Stack utilizzato

* React
* TypeScript
* Tailwind CSS
* Vite
* Open Library API
* localStorage

## Concetti praticati

Durante lo sviluppo del progetto ho lavorato su:

* componenti React
* props tipizzate
* `useState`
* `useEffect`
* `useRef`
* input controllati
* gestione degli eventi
* gestione dello stato dell’applicazione
* separazione tra risultati di ricerca e libreria personale
* array di oggetti
* metodi `map`, `filter`, `find` e `some`
* rendering condizionale
* funzioni passate come props
* aggiornamento immutabile dello state
* chiamate API con `fetch`
* `async / await`
* gestione di loading ed errori
* trasformazione dei dati ricevuti da API esterne
* definizione di tipi con TypeScript
* gestione dei fallback per dati mancanti
* persistenza dei dati tramite `localStorage`
* timer con `setInterval`
* pulizia degli effetti React
* scorrimento orizzontale tramite riferimenti DOM
* layout responsive con Tailwind CSS

## Struttura del progetto

```text
src/
  components/
    BookCard.tsx
    BookList.tsx
    LibrarySection.tsx
    LibrarySidebar.tsx
    RecommendedBookCard.tsx
    RecommendedBooks.tsx
  services/
    booksApi.ts
  types/
    book.ts
  App.tsx
  main.tsx
  index.css
```

## API utilizzata

Il progetto utilizza la Open Library Search API.

Esempio di endpoint per la ricerca per titolo:

```text
https://openlibrary.org/search.json?title=harry%20potter&limit=12
```

I dati restituiti dall’API vengono trasformati nel tipo interno `Book`, in modo che il resto dell’applicazione possa lavorare con una struttura più pulita e prevedibile.

Quando alcuni dati non sono disponibili, l’app utilizza valori di fallback per autore, anno, editore, numero di pagine e copertina.

## Persistenza dei dati

I risultati di ricerca e la libreria personale sono gestiti separatamente.

I risultati restituiti dall’API vengono salvati nello stato `searchResults`, mentre i libri modificati dall’utente vengono conservati nello stato `libraryBooks`.

Solo la libreria personale viene salvata nel `localStorage`. In questo modo una nuova ricerca non cancella i libri già salvati.

Quando un libro presente nella libreria compare nuovamente nei risultati, l’app ripristina automaticamente:

* stato di lettura
* preferito
* rating

## Avvio del progetto

Dopo aver clonato il repository, installare le dipendenze:

```bash
npm install
```

Avviare il server di sviluppo:

```bash
npm run dev
```

Creare la build di produzione:

```bash
npm run build
```

## Possibili evoluzioni future

* aggiungere una modale con maggiori dettagli sul libro
* migliorare le animazioni della sidebar e degli accordion
* aggiungere filtri e ordinamento nella libreria
* aggiungere stati vuoti più dettagliati
* introdurre test per componenti e funzioni principali
* aggiungere la possibilità di scrivere recensioni personali
* collegare un database o un sistema di autenticazione
* migliorare l’accessibilità tramite navigazione da tastiera

## Obiettivo del progetto

Questo progetto è stato creato per mettere in pratica React, TypeScript e Tailwind CSS attraverso una piccola applicazione realistica, sviluppata a partire da un’idea personale.

L’obiettivo principale è mostrare la capacità di lavorare con componenti riutilizzabili, API esterne, gestione dello stato, persistenza dei dati, TypeScript e interfacce responsive.

## Autore

Realizzato da Stefano Marzella come parte del mio percorso di crescita nel frontend development.

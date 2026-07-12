# Personal Reading Tracker

Personal Reading Tracker è una web app sviluppata con React, TypeScript, Tailwind CSS e Vite.

L’app permette di cercare libri tramite la Open Library API, visualizzare i risultati in card, assegnare uno stato di lettura, valutare i libri letti e salvare i preferiti in una libreria personale laterale.

Il progetto è stato realizzato come applicazione portfolio per consolidare i concetti principali di React e frontend development.

## Funzionalità

- Ricerca libri per titolo o autore
- Recupero dati reali dalla Open Library API
- Visualizzazione dei libri in card responsive
- Informazioni mostrate:
  - copertina
  - titolo
  - autore
  - anno di pubblicazione
  - editore
  - numero di pagine
- Gestione dello stato di lettura:
  - Want to read
  - Reading
  - Read
- Valutazione dei libri solo quando lo stato è `Read`
- Sistema di rating con stelle
- Possibilità di segnare un libro come preferito
- Sidebar “My Library” con sezioni dedicate:
  - Want to read
  - Reading
  - Read
  - Favourites
- Apertura e chiusura delle sezioni della libreria
- Rimozione dei singoli libri dalle sezioni
- Reset completo della libreria
- Persistenza dei dati tramite localStorage
- Interfaccia responsive realizzata con Tailwind CSS

## Stack utilizzato

- React
- TypeScript
- Tailwind CSS
- Vite
- Open Library API

## Concetti praticati

Durante lo sviluppo del progetto ho lavorato su:

- componenti React
- props tipizzate
- `useState`
- `useEffect`
- input controllati
- gestione degli eventi
- array di oggetti
- metodi `map` e `filter`
- rendering condizionale
- funzioni passate come props
- aggiornamento immutabile dello state
- chiamate API con `fetch`
- `async / await`
- gestione di loading ed errori
- trasformazione dei dati ricevuti da API esterne
- definizione di tipi base con TypeScript
- salvataggio dati in localStorage
- layout responsive con Tailwind CSS

## API utilizzata

Il progetto utilizza la Open Library Search API.

Esempio di endpoint:

https://openlibrary.org/search.json?title=harry%20potter&limit=12

I dati ricevuti dall’API vengono trasformati in un tipo interno Book, così il resto dell’app può lavorare con dati più puliti e prevedibili.

## Alcune possibili evoluzioni del progetto

- separare i risultati di ricerca dalla libreria personale
- aggiungere una modale per ingrandire la copertina dei libri
- aggiungere una sezione di libri consigliati
- migliorare la logica di persistenza con localStorage
- aggiungere animazioni alla sidebar e alle sezioni apribili
- migliorare gli stati vuoti dell’interfaccia
- aggiungere test per componenti e funzioni principali

## Obiettivo del progetto

Questo progetto è stato creato per mettere in pratica le basi di React, TypeScript e Tailwind CSS attraverso una piccola applicazione realistica, curata sia nella logica sia nell’interfaccia, su una mia idea personale.

## Autore

Realizzato da Stefano Marzella come parte del mio percorso di crescita nel frontend development.
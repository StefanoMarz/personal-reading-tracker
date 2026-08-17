import type { Book } from "../types/book";

export type SearchBy = "title" | "author";

// Rappresenta i campi dell'API che vengono utilizzati dall'app.
type OpenLibraryBook = {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  publisher?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
};

// Tipizza la struttura principale della risposta di Open Library.
type OpenLibraryResponse = {
  docs: unknown[];
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isOpenLibraryBook = (value: unknown): value is OpenLibraryBook => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const book = value as Record<string, unknown>;

  return (
    typeof book.key === "string" &&
    typeof book.title === "string" &&
    (book.author_name === undefined || isStringArray(book.author_name)) &&
    (book.first_publish_year === undefined ||
      typeof book.first_publish_year === "number") &&
    (book.publisher === undefined || isStringArray(book.publisher)) &&
    (book.cover_i === undefined || typeof book.cover_i === "number") &&
    (book.number_of_pages_median === undefined ||
      typeof book.number_of_pages_median === "number")
  );
};

const fetchOpenLibraryBooks = async (
  url: string,
  signal?: AbortSignal
): Promise<OpenLibraryBook[]> => {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Open Library request failed with status ${response.status}`);
  }

  const data: unknown = await response.json();

  // FIX: i tipi TypeScript non convalidano i dati ricevuti dalla rete.
  // Scartiamo quindi record malformati invece di far fallire tutta l'interfaccia.
  if (
    typeof data !== "object" ||
    data === null ||
    !Array.isArray((data as OpenLibraryResponse).docs)
  ) {
    throw new Error("Open Library returned an invalid response");
  }

  return (data as OpenLibraryResponse).docs.filter(isOpenLibraryBook);
};

// Argomenti utilizzati per ottenere consigli diversi a ogni caricamento.

const recommendationSubjects = [
  "classic literature",
  "fantasy",
  "science fiction",
  "mystery",
  "historical fiction",
  "adventure",
  "romance",
  "thriller",
];

/*
 * Converte un risultato di Open Library nel tipo Book utilizzato
 * internamente dall'applicazione.
 */
const mapOpenLibraryBook = (book: OpenLibraryBook): Book => {
  return {
    id: book.key,
    title: book.title,
    author: book.author_name?.[0] ?? "Unknown author",
    year: book.first_publish_year ?? "Year unavailable",
    publisher: book.publisher?.[0] ?? "Publisher unavailable",

    coverUrl: book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
      : "https://placehold.co/200x300?text=No+Cover",

    pages: book.number_of_pages_median ?? "Pages unavailable",
    status: "",
    isFavorite: false,
    rating: 0,
  };
};

// Cerca i libri per titolo oppure per autore.
export async function searchBooks(
  query: string,
  searchBy: SearchBy,
  signal?: AbortSignal
): Promise<Book[]> {
  const encodedQuery = encodeURIComponent(query);

  const url =
    searchBy === "title"
      ? `https://openlibrary.org/search.json?title=${encodedQuery}&limit=12`
      : `https://openlibrary.org/search.json?author=${encodedQuery}&limit=12`;

  const books = await fetchOpenLibraryBooks(url, signal);

  return books.map(mapOpenLibraryBook);
}

// Recupera un gruppo di libri consigliati scegliendo un argomento casuale.
export async function getRecommendedBooks(
  signal?: AbortSignal
): Promise<Book[]> {
  const randomSubject =
    recommendationSubjects[
      Math.floor(Math.random() * recommendationSubjects.length)
    ];

  const encodedSubject = encodeURIComponent(randomSubject);

  const url = `https://openlibrary.org/search.json?q=${encodedSubject}&limit=20`;

  const books = await fetchOpenLibraryBooks(url, signal);

  //Esclude i libri privi di copertina perché le immagini in questo caso sono prioritarie

  return books
    .filter((book) => book.cover_i)
    .slice(0, 12)
    .map(mapOpenLibraryBook);
}

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
  docs: OpenLibraryBook[];
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
  searchBy: SearchBy
): Promise<Book[]> {
  const encodedQuery = encodeURIComponent(query);

  const url =
    searchBy === "title"
      ? `https://openlibrary.org/search.json?title=${encodedQuery}&limit=12`
      : `https://openlibrary.org/search.json?author=${encodedQuery}&limit=12`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch books");
  }

  const data: OpenLibraryResponse = await response.json();

  return data.docs.map(mapOpenLibraryBook);
}

// Recupera un gruppo di libri consigliati scegliendo un argomento casuale.
export async function getRecommendedBooks(): Promise<Book[]> {
  const randomSubject =
    recommendationSubjects[
      Math.floor(Math.random() * recommendationSubjects.length)
    ];

  const encodedSubject = encodeURIComponent(randomSubject);

  const url = `https://openlibrary.org/search.json?q=${encodedSubject}&limit=20`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch recommended books");
  }

  const data: OpenLibraryResponse = await response.json();

  //Esclude i libri privi di copertina perché le immagini in questo caso sono prioritarie

  return data.docs
    .filter((book) => book.cover_i)
    .slice(0, 12)
    .map(mapOpenLibraryBook);
}

import type { Book } from "../types/book";

export type SearchBy = "title" | "author";

type OpenLibraryBook = {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    publisher?: string[];
    cover_i?: number;
    number_of_pages_median?: number;
  };

export async function searchBooks(query: string, searchBy: SearchBy): Promise<Book[]> {
    const encodedQuery = encodeURIComponent(query);

const url =
searchBy === "title"
? `https://openlibrary.org/search.json?title=${encodedQuery}&limit=12`
: `https://openlibrary.org/search.json?author=${encodedQuery}&limit=12`;
  
      const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch books");
  }

  const data = await response.json();

  const cleanBooks: Book[] = data.docs.map((book: OpenLibraryBook) => {
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
  });

  return cleanBooks;
}
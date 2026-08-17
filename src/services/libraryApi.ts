import { supabase } from "../lib/supabase";
import type { Book, ReadingStatus } from "../types/book";

const FALLBACK_COVER_URL = "https://placehold.co/200x300?text=No+Cover";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readOptionalInteger = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.round(value)
    : null;

const readDatabaseStatus = (value: unknown): ReadingStatus => {
  if (
    value === "want to read" ||
    value === "reading" ||
    value === "read"
  ) {
    return value;
  }

  return "";
};

// Le risposte del database arrivano a runtime: TypeScript da solo non puo
// garantire che ogni campo contenga davvero il tipo dichiarato nello schema.
const mapDatabaseBook = (value: unknown): Book | null => {
  if (
    !isRecord(value) ||
    typeof value.open_library_id !== "string" ||
    value.open_library_id.trim() === "" ||
    typeof value.title !== "string" ||
    value.title.trim() === ""
  ) {
    return null;
  }

  const status = readDatabaseStatus(value.status);
  const rating = readOptionalInteger(value.rating) ?? 0;

  return {
    id: value.open_library_id,
    title: value.title,
    author:
      typeof value.author === "string" ? value.author : "Unknown author",
    year:
      readOptionalInteger(value.publication_year) ?? "Year unavailable",
    publisher:
      typeof value.publisher === "string"
        ? value.publisher
        : "Publisher unavailable",
    coverUrl:
      typeof value.cover_url === "string" && value.cover_url !== ""
        ? value.cover_url
        : FALLBACK_COVER_URL,
    pages: readOptionalInteger(value.pages) ?? "Pages unavailable",
    status,
    isFavorite: value.is_favorite === true,
    rating:
      status === "read" ? Math.min(5, Math.max(0, rating)) : 0,
  };
};

const toDatabaseInteger = (value: number | string) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.round(value)
    : null;

const toDatabaseBook = (userId: string, book: Book) => ({
  user_id: userId,
  open_library_id: book.id,
  title: book.title,
  author: book.author,
  publication_year: toDatabaseInteger(book.year),
  publisher:
    book.publisher === "Publisher unavailable" ? null : book.publisher,
  cover_url: book.coverUrl,
  pages: toDatabaseInteger(book.pages),
  status: book.status || null,
  is_favorite: book.isFavorite,
  rating: book.status === "read" ? book.rating : 0,
});

export const fetchRemoteLibraryBooks = async (
  userId: string
): Promise<Book[]> => {
  const { data, error } = await supabase
    .from("library_books")
    .select(
      "open_library_id, title, author, publication_year, publisher, cover_url, pages, status, is_favorite, rating"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows: unknown[] = Array.isArray(data) ? data : [];

  return rows
    .map(mapDatabaseBook)
    .filter((book): book is Book => book !== null);
};

export const saveRemoteLibraryBook = async (
  userId: string,
  book: Book
) => {
  const { error } = await supabase.from("library_books").upsert(
    toDatabaseBook(userId, book),
    {
      onConflict: "user_id,open_library_id",
    }
  );

  if (error) {
    throw new Error(error.message);
  }
};

export const saveRemoteLibraryBooks = async (
  userId: string,
  books: Book[]
) => {
  if (books.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("library_books")
    .upsert(
      books.map((book) => toDatabaseBook(userId, book)),
      { onConflict: "user_id,open_library_id" }
    );

  if (error) {
    throw new Error(error.message);
  }
};

export const deleteRemoteLibraryBook = async (
  userId: string,
  openLibraryId: string
) => {
  const { error } = await supabase
    .from("library_books")
    .delete()
    .eq("user_id", userId)
    .eq("open_library_id", openLibraryId);

  if (error) {
    throw new Error(error.message);
  }
};

export const deleteAllRemoteLibraryBooks = async (userId: string) => {
  const { error } = await supabase
    .from("library_books")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
};

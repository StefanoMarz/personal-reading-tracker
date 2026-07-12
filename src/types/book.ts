export type ReadingStatus = "" | "want to read" | "reading" | "read";

export type LibrarySectionType =
  | "want to read"
  | "reading"
  | "read"
  | "favourites";

export type Book = {
  id: string;
  title: string;
  author: string;
  year: number | string;
  publisher: string;
  coverUrl: string;
  pages: number | string;
  status: ReadingStatus;
  isFavorite: boolean;
  rating: number;
};
import type { Book, ReadingStatus } from "../types/book";

export const isBookSaved = (book: Book) =>
  book.status !== "" || book.isFavorite || book.rating > 0;

export const mergePersonalDataIntoResults = (
  searchResults: Book[],
  savedBooks: Book[]
) => {
  const savedBooksById = new Map(
    savedBooks.map((book) => [book.id, book])
  );

  return searchResults.map((book) => {
    const savedBook = savedBooksById.get(book.id);

    // I metadati bibliografici della ricerca sono i piu recenti; dalla copia
    // salvata recuperiamo esclusivamente i campi personali dell'utente.
    return {
      ...book,
      status: savedBook?.status ?? "",
      isFavorite: savedBook?.isFavorite ?? false,
      rating: savedBook?.rating ?? 0,
    };
  });
};

export const mergeGuestBookIntoRemoteBook = (
  remoteBook: Book | undefined,
  guestBook: Book
) => {
  if (!remoteBook) {
    return guestBook;
  }

  // I dati gia presenti nell'account hanno la precedenza. Il preferito viene
  // unito e i campi ospite colmano solo informazioni personali mancanti.
  const status = remoteBook.status || guestBook.status;

  return {
    ...remoteBook,
    status,
    isFavorite: remoteBook.isFavorite || guestBook.isFavorite,
    rating:
      status === "read"
        ? remoteBook.rating ||
          (guestBook.status === "read" ? guestBook.rating : 0)
        : 0,
  };
};

export const updateBookStatus = (
  book: Book,
  newStatus: ReadingStatus
): Book => ({
  ...book,
  status: newStatus,
  rating: newStatus === "read" ? book.rating : 0,
});

export const updateBookRating = (book: Book, newRating: number): Book => {
  const safeRating = Number.isFinite(newRating)
    ? Math.min(5, Math.max(0, Math.round(newRating)))
    : 0;

  return {
    ...book,
    rating: book.status === "read" ? safeRating : 0,
  };
};

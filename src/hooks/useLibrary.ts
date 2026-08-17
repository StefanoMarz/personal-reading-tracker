import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type {
  Book,
  LibrarySectionType,
  ReadingStatus,
} from "../types/book";
import {
  deleteAllRemoteLibraryBooks,
  deleteRemoteLibraryBook,
  fetchRemoteLibraryBooks,
  saveRemoteLibraryBook,
  saveRemoteLibraryBooks,
} from "../services/libraryApi";
import {
  isBookSaved,
  mergeGuestBookIntoRemoteBook,
  mergePersonalDataIntoResults,
  updateBookRating,
  updateBookStatus,
} from "../utils/libraryBooks";

const LOCAL_STORAGE_KEY = "personal-reading-tracker-books";
const FALLBACK_COVER_URL = "https://placehold.co/200x300?text=No+Cover";
const READING_STATUSES: ReadingStatus[] = [
  "",
  "want to read",
  "reading",
  "read",
];

type UseLibraryProps = {
  searchResults: Book[];
  setSearchResults: Dispatch<SetStateAction<Book[]>>;
  userId: string | null;
};

type LibraryMode = "guest" | "remote-loading" | "remote";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isReadingStatus = (value: unknown): value is ReadingStatus =>
  READING_STATUSES.some((status) => status === value);

const isDisplayValue = (value: unknown): value is number | string =>
  typeof value === "string" ||
  (typeof value === "number" && Number.isFinite(value));

const normalizeStoredBook = (value: unknown): Book | null => {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    value.id.trim() === "" ||
    typeof value.title !== "string" ||
    value.title.trim() === ""
  ) {
    return null;
  }

  const status = isReadingStatus(value.status) ? value.status : "";
  const numericRating =
    typeof value.rating === "number" && Number.isFinite(value.rating)
      ? Math.round(value.rating)
      : 0;

  return {
    id: value.id,
    title: value.title,
    author:
      typeof value.author === "string" ? value.author : "Unknown author",
    year: isDisplayValue(value.year) ? value.year : "Year unavailable",
    publisher:
      typeof value.publisher === "string"
        ? value.publisher
        : "Publisher unavailable",
    coverUrl:
      typeof value.coverUrl === "string" && value.coverUrl !== ""
        ? value.coverUrl
        : FALLBACK_COVER_URL,
    pages: isDisplayValue(value.pages) ? value.pages : "Pages unavailable",
    status,
    isFavorite: value.isFavorite === true,
    rating:
      status === "read" ? Math.min(5, Math.max(0, numericRating)) : 0,
  };
};

const loadSavedLibrary = (): Book[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedBooks = window.localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!savedBooks) {
      return [];
    }

    const parsedBooks: unknown = JSON.parse(savedBooks);

    if (!Array.isArray(parsedBooks)) {
      return [];
    }

    // FIX: localStorage è modificabile dall'esterno e non è tipizzato.
    // Normalizziamo i dati per evitare rating invalidi e record che rompono la UI.
    const normalizedBooks = parsedBooks
      .map(normalizeStoredBook)
      .filter((book): book is Book => book !== null && isBookSaved(book));

    return Array.from(
      new Map(normalizedBooks.map((book) => [book.id, book])).values()
    );
  } catch (error) {
    // FIX: getItem e JSON.parse possono fallire in browser con storage bloccato.
    console.error("Unable to load the saved library:", error);
    return [];
  }
};

export const useLibrary = ({
  searchResults,
  setSearchResults,
  userId,
}: UseLibraryProps) => {
  const [libraryBooks, setLibraryBooks] =
    useState<Book[]>(loadSavedLibrary);
  const [libraryMode, setLibraryMode] =
    useState<LibraryMode>("guest");
  const [libraryError, setLibraryError] = useState("");
  const [libraryNotice, setLibraryNotice] = useState("");
  const [guestBooksToImport, setGuestBooksToImport] = useState<Book[]>([]);
  const [isImportingGuestLibrary, setIsImportingGuestLibrary] =
    useState(false);
  const activeUserIdRef = useRef<string | null>(userId);
  const libraryRequestIdRef = useRef(0);

  const applyLibraryBooks = useCallback(
    (books: Book[]) => {
      setLibraryBooks(books);
      setSearchResults((currentResults) =>
        mergePersonalDataIntoResults(currentResults, books)
      );
    },
    [setSearchResults]
  );

  const loadRemoteLibrary = useCallback(
    async (targetUserId: string) => {
      const requestId = libraryRequestIdRef.current + 1;
      libraryRequestIdRef.current = requestId;
      setLibraryMode("remote-loading");
      setLibraryError("");
      setLibraryNotice("");
      applyLibraryBooks([]);

      try {
        const remoteBooks = await fetchRemoteLibraryBooks(targetUserId);

        if (
          requestId !== libraryRequestIdRef.current ||
          activeUserIdRef.current !== targetUserId
        ) {
          return;
        }

        applyLibraryBooks(remoteBooks);
        setGuestBooksToImport(loadSavedLibrary());
        setLibraryMode("remote");
      } catch (error) {
        if (
          requestId !== libraryRequestIdRef.current ||
          activeUserIdRef.current !== targetUserId
        ) {
          return;
        }

        console.error("Unable to load the remote library:", error);
        setLibraryError(
          error instanceof Error
            ? error.message
            : "Unable to load your library."
        );
        setLibraryMode("remote");
      }
    },
    [applyLibraryBooks]
  );

  useEffect(() => {
    activeUserIdRef.current = userId;
    libraryRequestIdRef.current += 1;

    // L'aggiornamento parte dopo la fase sincrona dell'effect, evitando un
    // render a cascata mentre React sta ancora applicando gli effetti.
    const timeoutId = window.setTimeout(() => {
      if (userId) {
        void loadRemoteLibrary(userId);
        return;
      }

      // Ripristina la libreria ospite senza averla sovrascritta durante il login.
      setLibraryError("");
      setLibraryNotice("");
      setGuestBooksToImport([]);
      setLibraryMode("guest");
      applyLibraryBooks(loadSavedLibrary());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [applyLibraryBooks, loadRemoteLibrary, userId]);

  useEffect(() => {
    if (libraryMode !== "guest" || userId !== null) {
      return;
    }

    try {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(libraryBooks)
      );
    } catch (error) {
      // FIX: una quota esaurita o storage disabilitato non deve bloccare l'app.
      console.error("Unable to save the library:", error);
    }
  }, [libraryBooks, libraryMode, userId]);

  const recoverRemoteLibraryAfterError = async (
    targetUserId: string,
    error: unknown
  ) => {
    console.error("Unable to synchronize the remote library:", error);
    await loadRemoteLibrary(targetUserId);

    if (activeUserIdRef.current === targetUserId) {
      setLibraryError(
        "The last change was not saved. The library was reloaded from Supabase."
      );
    }
  };

  const persistUpdatedBook = (updatedBook: Book) => {
    if (!userId) {
      return;
    }

    const targetUserId = userId;
    setLibraryError("");
    setLibraryNotice("");

    void (async () => {
      try {
        if (isBookSaved(updatedBook)) {
          await saveRemoteLibraryBook(targetUserId, updatedBook);
        } else {
          await deleteRemoteLibraryBook(targetUserId, updatedBook.id);
        }
      } catch (error) {
        await recoverRemoteLibraryAfterError(targetUserId, error);
      }
    })();
  };

  const updateBookEverywhere = (
    bookId: string,
    updateBook: (book: Book) => Book
  ) => {
    // FIX: il risultato API corrente contiene i metadati più aggiornati; la copia
    // salvata viene usata solo quando il libro non è presente nella ricerca.
    const sourceBook =
      searchResults.find((book) => book.id === bookId) ??
      libraryBooks.find((book) => book.id === bookId);

    if (!sourceBook) {
      return;
    }

    const updatedBook = updateBook(sourceBook);

    setSearchResults((currentResults) =>
      currentResults.map((book) =>
        book.id === bookId ? updatedBook : book
      )
    );

    setLibraryBooks((currentLibrary) => {
      if (!isBookSaved(updatedBook)) {
        return currentLibrary.filter((book) => book.id !== bookId);
      }

      const alreadySaved = currentLibrary.some(
        (book) => book.id === bookId
      );

      if (alreadySaved) {
        return currentLibrary.map((book) =>
          book.id === bookId ? updatedBook : book
        );
      }

      return [...currentLibrary, updatedBook];
    });

    persistUpdatedBook(updatedBook);
  };

  const handleResetLibrary = () => {
    const targetUserId = userId;
    setLibraryBooks([]);

    setSearchResults((currentResults) =>
      currentResults.map((book) => ({
        ...book,
        status: "",
        isFavorite: false,
        rating: 0,
      }))
    );

    if (targetUserId) {
      setLibraryError("");
      setLibraryNotice("");

      void deleteAllRemoteLibraryBooks(targetUserId).catch((error) =>
        recoverRemoteLibraryAfterError(targetUserId, error)
      );
    }
  };

  const importGuestLibrary = async () => {
    if (!userId || guestBooksToImport.length === 0) {
      return;
    }

    const targetUserId = userId;
    const remoteBooksById = new Map(
      libraryBooks.map((book) => [book.id, book])
    );
    const importedBooks = guestBooksToImport.map((guestBook) =>
      mergeGuestBookIntoRemoteBook(
        remoteBooksById.get(guestBook.id),
        guestBook
      )
    );

    setIsImportingGuestLibrary(true);
    setLibraryError("");
    setLibraryNotice("");

    try {
      await saveRemoteLibraryBooks(targetUserId, importedBooks);

      if (activeUserIdRef.current !== targetUserId) {
        return;
      }

      importedBooks.forEach((book) => remoteBooksById.set(book.id, book));
      applyLibraryBooks(Array.from(remoteBooksById.values()));

      try {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (storageError) {
        console.error(
          "Unable to clear the imported guest library:",
          storageError
        );
      }

      setGuestBooksToImport([]);
      setLibraryNotice("Guest library imported successfully.");
    } catch (error) {
      console.error("Unable to import the guest library:", error);
      setLibraryError(
        error instanceof Error
          ? error.message
          : "Unable to import the guest library."
      );
    } finally {
      setIsImportingGuestLibrary(false);
    }
  };

  const handleRemoveFromLibrarySection = (
    bookId: string,
    section: LibrarySectionType
  ) => {
    updateBookEverywhere(bookId, (book) => {
      if (section === "favourites") {
        return {
          ...book,
          isFavorite: false,
        };
      }

      return {
        ...book,
        status: "",
        rating: 0,
      };
    });
  };

  const handleStatusChange = (
    bookId: string,
    newStatus: ReadingStatus
  ) => {
    updateBookEverywhere(bookId, (book) =>
      updateBookStatus(book, newStatus)
    );
  };

  const handleRatingChange = (bookId: string, newRating: number) => {
    updateBookEverywhere(bookId, (book) =>
      updateBookRating(book, newRating)
    );
  };

  const handleFavoriteToggle = (bookId: string) => {
    updateBookEverywhere(bookId, (book) => ({
      ...book,
      isFavorite: !book.isFavorite,
    }));
  };

  return {
    libraryBooks,
    isLibraryLoading: libraryMode === "remote-loading",
    libraryError,
    libraryNotice,
    guestBooksToImportCount: guestBooksToImport.length,
    isImportingGuestLibrary,
    importGuestLibrary,
    dismissGuestLibraryImport: () => setGuestBooksToImport([]),
    retryLibrary: () => {
      if (userId) {
        void loadRemoteLibrary(userId);
      }
    },
    savedBooksCount: libraryBooks.length,
    wantToReadBooks: libraryBooks.filter(
      (book) => book.status === "want to read"
    ),
    readingBooks: libraryBooks.filter(
      (book) => book.status === "reading"
    ),
    readBooks: libraryBooks.filter((book) => book.status === "read"),
    favouriteBooks: libraryBooks.filter((book) => book.isFavorite),
    handleResetLibrary,
    handleRemoveFromLibrarySection,
    handleStatusChange,
    handleRatingChange,
    handleFavoriteToggle,
  };
};

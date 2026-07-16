import { useEffect, useState } from "react";
import { BookList } from "./components/BookList";
import { LibrarySidebar } from "./components/LibrarySidebar";
import type {
  Book,
  ReadingStatus,
  LibrarySectionType,
} from "./types/book";
import { searchBooks, type SearchBy } from "./services/booksApi";

const LOCAL_STORAGE_KEY = "personal-reading-tracker-books";

const App = () => {
  const [search, setSearch] = useState("");

  // Contains only the books returned by the latest API search.
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  // Restores the personal library from localStorage when the app starts.
  const [libraryBooks, setLibraryBooks] = useState<Book[]>(() => {
    const savedBooks = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!savedBooks) {
      return [];
    }

    try {
      return JSON.parse(savedBooks) as Book[];
    } catch (error) {
      console.error("Could not read the saved library:", error);
      return [];
    }
  });

  const [searchBy, setSearchBy] = useState<SearchBy>("title");
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Keeps the personal library synchronized with localStorage.
  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(libraryBooks)
    );
  }, [libraryBooks]);

  // Determines whether a book should remain inside the personal library.
  const isBookSaved = (book: Book) => {
    return book.status !== "" || book.isFavorite || book.rating > 0;
  };

  /*
   * Updates a book both in the search results and in the personal library.
   * If the book has no status, favourite or rating, it is removed from
   * libraryBooks but can remain visible in the current search results.
   */
  const updateBookEverywhere = (
    bookId: string,
    updateBook: (book: Book) => Book
  ) => {
    const sourceBook =
      libraryBooks.find((book) => book.id === bookId) ??
      searchResults.find((book) => book.id === bookId);

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
  };

  const handleSearch = async () => {
    const cleanSearch = search.trim();

    if (cleanSearch === "") {
      return;
    }

    setHasSearched(true);
    setIsLoading(true);
    setError("");

    try {
      const results = await searchBooks(cleanSearch, searchBy);

      /*
       * Reapplies saved status, rating and favourite values when a book
       * already exists in the personal library.
       */
      const resultsWithSavedData = results.map((result) => {
        const savedBook = libraryBooks.find(
          (libraryBook) => libraryBook.id === result.id
        );

        if (!savedBook) {
          return result;
        }

        return {
          ...result,
          status: savedBook.status,
          isFavorite: savedBook.isFavorite,
          rating: savedBook.rating,
        };
      });

      setSearchResults(resultsWithSavedData);
    } catch (error) {
      console.error(error);
      setSearchResults([]);
      setError("Something went wrong while searching books.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clears the library without removing the current search results.
  const handleResetLibrary = () => {
    setLibraryBooks([]);

    setSearchResults((currentResults) =>
      currentResults.map((book) => ({
        ...book,
        status: "",
        isFavorite: false,
        rating: 0,
      }))
    );
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
    updateBookEverywhere(bookId, (book) => ({
      ...book,
      status: newStatus,

      // A rating is valid only for books marked as read.
      rating: newStatus === "read" ? book.rating : 0,
    }));
  };

  const handleRatingChange = (
    bookId: string,
    newRating: number
  ) => {
    updateBookEverywhere(bookId, (book) => ({
      ...book,
      rating: newRating,
    }));
  };

  const handleFavoriteToggle = (bookId: string) => {
    updateBookEverywhere(bookId, (book) => ({
      ...book,
      isFavorite: !book.isFavorite,
    }));
  };

  // Creates the four library sections from the saved books.
  const wantToReadBooks = libraryBooks.filter(
    (book) => book.status === "want to read"
  );

  const readingBooks = libraryBooks.filter(
    (book) => book.status === "reading"
  );

  const readBooks = libraryBooks.filter(
    (book) => book.status === "read"
  );

  const favouriteBooks = libraryBooks.filter(
    (book) => book.isFavorite
  );

  const savedBooksCount = libraryBooks.length;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-violet-300">
            Personal Reading Tracker
          </p>

          <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            Build your personal book space
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Search books, track your reading status, rate completed books,
            and save your favourites.
          </p>

          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20"
          >
            My Library

            {savedBooksCount > 0 && (
              <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-200">
                {savedBooksCount}
              </span>
            )}
          </button>
        </div>

        <div className="rounded-2xl border border-violet-500/20 bg-slate-900 p-4 shadow-lg shadow-black/20">
          <div className="flex gap-3">
            <select
              value={searchBy}
              onChange={(event) =>
                setSearchBy(event.target.value as SearchBy)
              }
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
            </select>

            <input
              type="text"
              placeholder="Search a book title..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleSearch();
                }
              }}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />

            <button
              type="button"
              onClick={handleSearch}
              disabled={search.trim() === "" || isLoading}
              className="rounded-xl bg-violet-600 px-5 py-3 font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Search
            </button>
          </div>
        </div>

        {isLoading && (
          <p className="mt-6 text-slate-400">
            Searching books...
          </p>
        )}

        {error && (
          <p className="mt-6 text-red-400">
            {error}
          </p>
        )}

        {hasSearched &&
          !isLoading &&
          !error &&
          searchResults.length === 0 && (
            <p className="mt-6 text-slate-400">
              No books found.
            </p>
          )}

        <BookList
          books={searchResults}
          onStatusChange={handleStatusChange}
          onFavouriteToggle={handleFavoriteToggle}
          onRatingChange={handleRatingChange}
        />
      </div>

      {isLibraryOpen && (
        <LibrarySidebar
          wantToReadBooks={wantToReadBooks}
          readingBooks={readingBooks}
          readBooks={readBooks}
          favouriteBooks={favouriteBooks}
          onClose={() => setIsLibraryOpen(false)}
          onResetLibrary={handleResetLibrary}
          onRemoveBook={handleRemoveFromLibrarySection}
        />
      )}
    </main>
  );
};

export default App;
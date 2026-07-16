import { useEffect, useState } from "react";
import { BookList } from "./components/BookList";
import { LibrarySidebar } from "./components/LibrarySidebar";
import type { Book, ReadingStatus, LibrarySectionType } from "./types/book";
import { searchBooks, type SearchBy } from "./services/booksApi";

const App = () => {
  const [search, setSearch] = useState("");

  const [books, setBooks] = useState<Book[]>(() => {
    const savedBooks = localStorage.getItem("personal-reading-tracker-books");

    if (savedBooks) {
      return JSON.parse(savedBooks);
    }

    return [];
  });

  const [searchBy, setSearchBy] = useState<SearchBy>("title");
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "personal-reading-tracker-books",
      JSON.stringify(books)
    );
  }, [books]);

  const handleSearch = async () => {
    if (search.trim() === "") {
      return;
    }

    setHasSearched(true);
    setIsLoading(true);
    setError("");

    try {
      const results = await searchBooks(search, searchBy);
      setBooks(results);
    } catch (error) {
      console.error(error);
      setBooks([]);
      setError("Something went wrong while searching books.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetLibrary = () => {
    const resetBooks: Book[] = books.map((book) => {
      return {
        ...book,
        status: "",
        isFavorite: false,
        rating: 0,
      };
    });

    setBooks(resetBooks);
  };

  const handleRemoveFromLibrarySection = (
    bookId: string,
    section: LibrarySectionType
  ) => {
    const updatedBooks: Book[] = books.map((book) => {
      if (book.id !== bookId) {
        return book;
      }

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

    setBooks(updatedBooks);
  };

  const handleStatusChange = (bookId: string, newStatus: ReadingStatus) => {
    const updatedBooks: Book[] = books.map((book) => {
      if (book.id === bookId) {
        return {
          ...book,
          status: newStatus,
          rating: newStatus === "read" ? book.rating : 0,
        };
      }

      return book;
    });

    setBooks(updatedBooks);
  };

  const handleRatingChange = (bookId: string, newRating: number) => {
    const updatedBooks: Book[] = books.map((book) => {
      if (book.id === bookId) {
        return {
          ...book,
          rating: newRating,
        };
      }

      return book;
    });

    setBooks(updatedBooks);
  };

  const handleFavoriteToggle = (bookId: string) => {
    const updatedBooks: Book[] = books.map((book) => {
      if (book.id === bookId) {
        return {
          ...book,
          isFavorite: !book.isFavorite,
        };
      }

      return book;
    });

    setBooks(updatedBooks);
  };

  const wantToReadBooks = books.filter(
    (book) => book.status === "want to read"
  );
  const readingBooks = books.filter((book) => book.status === "reading");
  const readBooks = books.filter((book) => book.status === "read");
  const favouriteBooks = books.filter((book) => book.isFavorite);

  const savedBooksCount = books.filter((book) => {
    return book.status !== "" || book.isFavorite || book.rating > 0;
  }).length;

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
            Search books, track your reading status, rate completed books, and
            save your favourites.
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
              onChange={(event) => setSearchBy(event.target.value as SearchBy)}
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
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 outline-none"
            />

            <button
              onClick={handleSearch}
              disabled={search.trim() === "" || isLoading}
              className="rounded-xl bg-violet-600 px-5 py-3 font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Search
            </button>
          </div>
        </div>

        {isLoading && <p className="mt-6 text-slate-400">Searching books...</p>}

        {error && <p className="mt-6 text-red-400">{error}</p>}

        {hasSearched && !isLoading && !error && books.length === 0 && (
          <p className="mt-6 text-slate-400">No books found.</p>
        )}

        <BookList
          books={books}
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


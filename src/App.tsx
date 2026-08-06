import { useState } from "react";
import { BookList } from "./components/BookList";
import { LibrarySidebar } from "./components/LibrarySidebar";
import { RecommendedBooks } from "./components/RecommendedBooks";
import type { Book } from "./types/book";
import { searchBooks, type SearchBy } from "./services/booksApi";
import { SearchForm } from "./components/SearchForm";
import { useLibrary } from "./hooks/useLibrary";

const App = () => {
  const [search, setSearch] = useState("");

  // Contiene solamente i risultati restituiti dall'ultima ricerca.
  const [searchResults, setSearchResults] = useState<Book[]>([]);


  const [searchBy, setSearchBy] = useState<SearchBy>("title");
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const {
    libraryBooks,
    savedBooksCount,
    wantToReadBooks,
    readingBooks,
    readBooks,
    favouriteBooks,
    handleResetLibrary,
    handleRemoveFromLibrarySection,
    handleStatusChange,
    handleRatingChange,
    handleFavoriteToggle,
  } = useLibrary({
    searchResults,
    setSearchResults,
  });


  // Esegue la ricerca dei libri tramite Open Library API.
  const handleSearch = async (
    customQuery?: string,
    customSearchBy?: SearchBy
  ) => {
    const cleanSearch = (customQuery ?? search).trim();
    const selectedSearchBy = customSearchBy ?? searchBy;

    if (cleanSearch === "") {
      return;
    }

    setHasSearched(true);
    setIsLoading(true);
    setError("");

    try {
      const results = await searchBooks(cleanSearch, selectedSearchBy);

      /*
       * Se un risultato è già presente nella libreria, recupera
       * il suo stato, il rating e il valore del preferito.
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
      setSearch("");
    } catch (error) {
      console.error(error);
      setSearchResults([]);
      setError("Something went wrong while searching books.");
    } finally {
      setIsLoading(false);
    }
  };

  // Avvia una ricerca per titolo quando viene selezionato un libro consigliato.
  const handleRecommendedBookClick = (book: Book) => {
    setSearch(book.title);
    setSearchBy("title");
    void handleSearch(book.title, "title");
  };


  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-violet-300">
            Personal Reading Tracker
          </p>

          <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Build your personal book space
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Search books, track your reading status, rate completed books, and
            save your favourites.
          </p>

          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="mt-6 w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 sm:w-auto"
          >
            My Library
            {savedBooksCount > 0 && (
              <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-200">
                {savedBooksCount}
              </span>
            )}
          </button>
        </div>

        <SearchForm
          search={search}
          searchBy={searchBy}
          isLoading={isLoading}
          onSearchChange={setSearch}
          onSearchByChange={setSearchBy}
          onSubmit={() => void handleSearch()}
        />

        {!hasSearched && (
          <RecommendedBooks onBookClick={handleRecommendedBookClick} />
        )}

        {isLoading && <p className="mt-6 text-slate-400">Searching books...</p>}

        {error && <p className="mt-6 text-red-400">{error}</p>}

        {hasSearched && !isLoading && !error && searchResults.length === 0 && (
          <p className="mt-6 text-slate-400">No books found.</p>
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

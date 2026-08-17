import { useCallback, useEffect, useRef, useState } from "react";
import { BookList } from "./components/BookList";
import { LibrarySidebar } from "./components/LibrarySidebar";
import { RecommendedBooks } from "./components/RecommendedBooks";
import type { Book } from "./types/book";
import { searchBooks, type SearchBy } from "./services/booksApi";
import { SearchForm } from "./components/SearchForm";
import { useLibrary } from "./hooks/useLibrary";
import { AuthDialog } from "./components/AuthDialog";
import { ProfileDialog } from "./components/ProfileDialog";
import { useAuth } from "./hooks/useAuth";

const App = () => {
  const [search, setSearch] = useState("");

  // Contiene solamente i risultati restituiti dall'ultima ricerca.
  const [searchResults, setSearchResults] = useState<Book[]>([]);


  const [searchBy, setSearchBy] = useState<SearchBy>("title");
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const activeSearchControllerRef = useRef<AbortController | null>(null);
  const searchRequestIdRef = useRef(0);
  const libraryBooksRef = useRef<Book[]>([]);
  const libraryButtonRef = useRef<HTMLButtonElement>(null);

  const {
    userId,
    profile,
    isAuthLoading,
    authInitializationError,
    signIn,
    signUp,
    signOut,
    updateProfile,
  } = useAuth();

  const libraryTitle = profile?.firstName
    ? `${profile.firstName}’s Library`
    : "My Library";

  const {
    libraryBooks,
    savedBooksCount,
    wantToReadBooks,
    readingBooks,
    readBooks,
    favouriteBooks,
    isLibraryLoading,
    libraryError,
    libraryNotice,
    guestBooksToImportCount,
    isImportingGuestLibrary,
    importGuestLibrary,
    dismissGuestLibraryImport,
    retryLibrary,
    handleResetLibrary,
    handleRemoveFromLibrarySection,
    handleStatusChange,
    handleRatingChange,
    handleFavoriteToggle,
  } = useLibrary({
    searchResults,
    setSearchResults,
    userId,
  });

  useEffect(() => {
    // FIX: una ricerca può terminare dopo che la libreria è stata modificata.
    // Il ref permette di unire sempre i dati personali più recenti.
    libraryBooksRef.current = libraryBooks;
  }, [libraryBooks]);

  useEffect(() => {
    return () => activeSearchControllerRef.current?.abort();
  }, []);


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

    // FIX: annulla la richiesta precedente per evitare che una risposta lenta
    // sovrascriva i risultati di una ricerca più recente.
    activeSearchControllerRef.current?.abort();
    const controller = new AbortController();
    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;
    activeSearchControllerRef.current = controller;

    setHasSearched(true);
    setIsLoading(true);
    setError("");

    try {
      const results = await searchBooks(
        cleanSearch,
        selectedSearchBy,
        controller.signal
      );

      /*
       * Se un risultato è già presente nella libreria, recupera
       * il suo stato, il rating e il valore del preferito.
       */
      const resultsWithSavedData = results.map((result) => {
        const savedBook = libraryBooksRef.current.find(
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
      if (controller.signal.aborted) {
        return;
      }

      console.error(error);
      setSearchResults([]);
      setError("Something went wrong while searching books.");
    } finally {
      if (requestId === searchRequestIdRef.current) {
        setIsLoading(false);
        activeSearchControllerRef.current = null;
      }
    }
  };

  // Avvia una ricerca per titolo quando viene selezionato un libro consigliato.
  const handleRecommendedBookClick = (book: Book) => {
    setSearch(book.title);
    setSearchBy("title");
    void handleSearch(book.title, "title");
  };

  const handleSignOut = async () => {
    setSignOutError("");
    const nextSignOutError = await signOut();

    if (nextSignOutError) {
      setSignOutError(nextSignOutError);
    }
  };

  const handleOpenAuth = () => {
    setSignOutError("");
    setIsAuthOpen(true);
  };

  const handleCloseLibrary = useCallback(() => {
    setIsLibraryOpen(false);
    window.requestAnimationFrame(() => libraryButtonRef.current?.focus());
  }, []);

  const handleCloseAuth = useCallback(() => setIsAuthOpen(false), []);
  const handleCloseProfile = useCallback(
    () => setIsProfileOpen(false),
    []
  );


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

          <div className="mt-6 flex justify-center">
            <button
              ref={libraryButtonRef}
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 sm:w-auto"
            >
              {libraryTitle}
              {savedBooksCount > 0 && (
                <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-200">
                  {savedBooksCount}
                </span>
              )}
            </button>
          </div>
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
          libraryTitle={libraryTitle}
          profile={profile}
          isAuthLoading={isAuthLoading}
          authError={authInitializationError || signOutError}
          isLibraryLoading={isLibraryLoading}
          libraryError={libraryError}
          libraryNotice={libraryNotice}
          guestBooksToImportCount={guestBooksToImportCount}
          isImportingGuestLibrary={isImportingGuestLibrary}
          onClose={handleCloseLibrary}
          onOpenAuth={handleOpenAuth}
          onEditProfile={() => setIsProfileOpen(true)}
          onSignOut={() => void handleSignOut()}
          onRetryLibrary={retryLibrary}
          onImportGuestLibrary={() => void importGuestLibrary()}
          onDismissGuestLibraryImport={dismissGuestLibraryImport}
          onResetLibrary={handleResetLibrary}
          onRemoveBook={handleRemoveFromLibrarySection}
        />
      )}

      {isAuthOpen && (
        <AuthDialog
          onClose={handleCloseAuth}
          onSignIn={signIn}
          onSignUp={signUp}
        />
      )}

      {isProfileOpen && profile && (
        <ProfileDialog
          profile={profile}
          onClose={handleCloseProfile}
          onUpdateProfile={updateProfile}
        />
      )}
    </main>
  );
};

export default App;

import { useEffect, useRef } from "react";
import type { Book, LibrarySectionType } from "../types/book";
import type { AuthProfile } from "../hooks/useAuth";
import { LibrarySection } from "./LibrarySection";

type LibrarySidebarProps = {
  wantToReadBooks: Book[];
  readingBooks: Book[];
  readBooks: Book[];
  favouriteBooks: Book[];
  libraryTitle: string;
  profile: AuthProfile | null;
  isAuthLoading: boolean;
  authError: string;
  isLibraryLoading: boolean;
  libraryError: string;
  libraryNotice: string;
  guestBooksToImportCount: number;
  isImportingGuestLibrary: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  onEditProfile: () => void;
  onSignOut: () => void;
  onRetryLibrary: () => void;
  onImportGuestLibrary: () => void;
  onDismissGuestLibraryImport: () => void;
  onResetLibrary: () => void;
  onRemoveBook: (bookId: string, section: LibrarySectionType) => void;
};

export const LibrarySidebar = ({
  wantToReadBooks,
  readingBooks,
  readBooks,
  favouriteBooks,
  libraryTitle,
  profile,
  isAuthLoading,
  authError,
  isLibraryLoading,
  libraryError,
  libraryNotice,
  guestBooksToImportCount,
  isImportingGuestLibrary,
  onClose,
  onOpenAuth,
  onEditProfile,
  onSignOut,
  onRetryLibrary,
  onImportGuestLibrary,
  onDismissGuestLibraryImport,
  onResetLibrary,
  onRemoveBook,
}: LibrarySidebarProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-sidebar-title"
        className="ml-auto flex h-full w-full max-w-md flex-col bg-slate-950 p-4 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-violet-300">
              {libraryTitle}
            </p>
            <h2
              id="library-sidebar-title"
              className="mt-1 text-2xl font-bold text-white"
            >
              Saved books
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close library"
            className="rounded-full border border-slate-700 px-3 py-1 text-slate-300 transition hover:bg-slate-800"
          >
            ×
          </button>
        </div>

        <div className="mt-8 min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
          <section className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-violet-300">
              Account
            </p>

            {isAuthLoading ? (
              <p className="mt-3 text-sm text-slate-400">
                Checking session...
              </p>
            ) : profile ? (
              <div className="mt-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-500 font-semibold text-white">
                    {profile.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {profile.fullName}
                    </p>
                    <p className="truncate text-sm text-slate-400">
                      {profile.email}
                    </p>
                  </div>
                </div>

                {!isLibraryLoading && !libraryError && (
                  <p className="mt-3 text-xs text-emerald-300">
                    Your library is synchronized with your account.
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onEditProfile}
                    className="rounded-xl bg-violet-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-400"
                  >
                    Edit profile
                  </button>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <p className="font-medium text-white">Guest mode</p>
                <p className="mt-1 text-sm text-slate-400">
                  Your books are saved only on this device.
                </p>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="mt-4 w-full rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400"
                >
                  Sign in / Register
                </button>
              </div>
            )}

            {authError && (
              <p role="alert" className="mt-3 text-sm text-red-400">
                {authError}
              </p>
            )}
          </section>

          {profile && guestBooksToImportCount > 0 && (
            <section className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4">
              <p className="font-medium text-amber-200">
                Guest library found
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {guestBooksToImportCount}{" "}
                {guestBooksToImportCount === 1 ? "book is" : "books are"}{" "}
                saved on this device. Import them into your account?
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onImportGuestLibrary}
                  disabled={isImportingGuestLibrary}
                  className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isImportingGuestLibrary ? "Importing..." : "Import"}
                </button>
                <button
                  type="button"
                  onClick={onDismissGuestLibraryImport}
                  disabled={isImportingGuestLibrary}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Not now
                </button>
              </div>
            </section>
          )}

          {isLibraryLoading && (
            <p
              role="status"
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400"
            >
              Loading your saved books...
            </p>
          )}

          {libraryError && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 p-4"
            >
              <p className="text-sm text-red-300">{libraryError}</p>
              {profile && (
                <button
                  type="button"
                  onClick={onRetryLibrary}
                  className="mt-3 rounded-lg border border-red-400/30 px-3 py-1.5 text-sm font-medium text-red-200 transition hover:bg-red-500/10"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {libraryNotice && (
            <p
              role="status"
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              {libraryNotice}
            </p>
          )}

          <button
            type="button"
            onClick={onResetLibrary}
            className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
          >
            Reset library
          </button>

          <LibrarySection
            title="Want to read"
            books={wantToReadBooks}
            section="want to read"
            onRemoveBook={onRemoveBook}
          />

          <LibrarySection
            title="Reading"
            books={readingBooks}
            section="reading"
            onRemoveBook={onRemoveBook}
          />

          <LibrarySection
            title="Read"
            books={readBooks}
            section="read"
            showRating
            onRemoveBook={onRemoveBook}
          />

          <LibrarySection
            title="Favourites"
            books={favouriteBooks}
            section="favourites"
            showRating
            onRemoveBook={onRemoveBook}
          />
        </div>
      </aside>
    </div>
  );
};

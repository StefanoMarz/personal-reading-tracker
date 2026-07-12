import type { Book, LibrarySectionType } from "../types/book";
import { LibrarySection } from "./LibrarySection";

type LibrarySidebarProps = {
  wantToReadBooks: Book[];
  readingBooks: Book[];
  readBooks: Book[];
  favouriteBooks: Book[];
  onClose: () => void;
  onResetLibrary: () => void;
  onRemoveBook: (bookId: string, section: LibrarySectionType) => void;
};

export const LibrarySidebar = ({
  wantToReadBooks,
  readingBooks,
  readBooks,
  favouriteBooks,
  onClose,
  onResetLibrary,
  onRemoveBook,
}: LibrarySidebarProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <aside className="ml-auto flex h-full w-full max-w-md flex-col border-l border-violet-500/20 bg-slate-950 p-6 shadow-2xl shadow-black">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-violet-300">
              My Library
            </p>
            <h2 className="mt-1 text-2xl font-bold text-white">Saved books</h2>

            <button
              type="button"
              onClick={onResetLibrary}
              className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
            >
              Reset library
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700 px-3 py-1 text-slate-300 transition hover:bg-slate-800"
          >
            ×
          </button>
        </div>

        <div className="mt-8 min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
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

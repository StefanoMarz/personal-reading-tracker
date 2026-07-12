import { useState } from "react";
import type { Book, LibrarySectionType } from "../types/book";

type LibrarySectionProps = {
  title: string;
  books: Book[];
  section: LibrarySectionType;
  showRating?: boolean;
  onRemoveBook: (bookId: string, section: LibrarySectionType) => void;
};

export const LibrarySection = ({
  title,
  books,
  section,
  showRating = false,
  onRemoveBook,
}: LibrarySectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h3 className="font-medium text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {books.length} {books.length === 1 ? "book" : "books"}
          </p>
        </div>

        <span className="text-lg text-violet-300">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && books.length > 0 && (
        <ul className="mt-4 space-y-3">
          {books.map((book) => (
            <li
              key={book.id}
              className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3"
            >
              <img
                src={book.coverUrl}
                alt={`Cover of ${book.title}`}
                className="h-20 w-14 rounded-lg object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium text-white">
                      {book.title}
                    </p>

                    <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                      {book.author}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {book.isFavorite && (
                      <span className="text-lg leading-none text-violet-400">
                        ♥
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onRemoveBook(book.id, section)}
                      className="rounded-full border border-slate-700 px-2 text-xs text-slate-400 transition hover:border-red-500/50 hover:text-red-300"
                      aria-label={`Remove ${book.title} from ${title}`}
                    >
                      ×
                    </button>
                  </div>
                </div>

                {showRating && book.status === "read" && (
                  <p className="mt-2 text-sm text-emerald-400">
                    {book.rating > 0 ? (
                      <>
                        {"★".repeat(book.rating)}
                        {"☆".repeat(5 - book.rating)}
                      </>
                    ) : (
                      <span className="text-xs text-slate-500">No rating</span>
                    )}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && books.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">No books yet.</p>
      )}
    </section>
  );
};

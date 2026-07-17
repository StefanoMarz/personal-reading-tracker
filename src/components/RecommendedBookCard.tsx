import type { Book } from "../types/book";

type RecommendedBookCardProps = {
  book: Book;
  onBookClick: (book: Book) => void;
};

export const RecommendedBookCard = ({
  book,
  onBookClick,
}: RecommendedBookCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onBookClick(book)}
      className="group w-28 shrink-0 text-left sm:w-32 md:w-36"
      aria-label={`Search for ${book.title}`}
    >
      <div className="h-44 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-md shadow-black/20 sm:h-52 md:h-56">
        <img
          src={book.coverUrl}
          alt={`Cover of ${book.title}`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <h3 className="mt-2 min-h-10 line-clamp-2 text-sm font-medium text-slate-200 transition group-hover:text-violet-300">
        {book.title}
      </h3>

      <p className="mt-1 truncate text-xs text-slate-500">{book.author}</p>
    </button>
  );
};

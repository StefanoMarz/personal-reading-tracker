import type { Book, ReadingStatus } from "../types/book";

type BookCardProps = {
  book: Book;
  onStatusChange: (bookId: string, newStatus: ReadingStatus) => void;
  onFavouriteToggle: (bookId: string) => void;
  onRatingChange: (bookId: string, newRating: number) => void;
};

export const BookCard = ({
  book,
  onStatusChange,
  onFavouriteToggle,
  onRatingChange,
}: BookCardProps) => {
  return (
    <li className="flex min-h-96 w-full max-w-sm justify-self-center flex-col rounded-2xl border border-violet-500/20 bg-slate-900 p-4 shadow-lg shadow-black/20 sm:max-w-none">
      <div className="relative">
        <img
          src={book.coverUrl}
          alt={`Copertina di ${book.title}`}
          className="mx-auto h-48 w-32 rounded-xl object-cover"
        />

        <button
          type="button"
          onClick={() => onFavouriteToggle(book.id)}
          aria-label={
            book.isFavorite
              ? `Remove ${book.title} from favourites`
              : `Add ${book.title} to favourites`
          }
          className="absolute right-3 top-3 text-3xl leading-none text-violet-400 transition hover:text-violet-300"
        >
          {book.isFavorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <div>
          <h2 className="line-clamp-2 text-base font-semibold text-white">
            {book.title}
          </h2>

          <p className="mt-1 truncate text-sm text-slate-300">{book.author}</p>

          <div className="mt-3 space-y-1 text-xs text-slate-400">
            <p>Year: {book.year}</p>

            <p className="truncate">Publisher: {book.publisher}</p>

            <p>
              Pages: <span className="text-emerald-400">{book.pages}</span>
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <select
            value={book.status}
            onChange={(event) =>
              onStatusChange(book.id, event.target.value as ReadingStatus)
            }
            className="w-full rounded-xl border border-violet-500/30 bg-slate-800 px-3 py-2 text-sm text-violet-100 outline-none transition focus:border-violet-400"
          >
            <option value="">No status</option>
            <option value="want to read">Want to read</option>
            <option value="reading">Reading</option>
            <option value="read">Read</option>
          </select>

          <div className="mt-3 flex min-h-8 items-center gap-1">
            {book.status === "read" &&
              [1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    const newRating = book.rating === star ? 0 : star;

                    onRatingChange(book.id, newRating);
                  }}
                  aria-label={`Rate ${book.title} ${star} out of 5`}
                  className="text-2xl text-emerald-400 transition hover:scale-110"
                >
                  {star <= book.rating ? "★" : "☆"}
                </button>
              ))}
          </div>
        </div>
      </div>
    </li>
  );
};

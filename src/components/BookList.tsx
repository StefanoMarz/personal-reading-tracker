import type { Book, ReadingStatus } from "../types/book";
import { BookCard } from "./BookCard";

type BookListProps = {
  books: Book[];
  onStatusChange: (bookId: string, newStatus: ReadingStatus) => void;
  onFavouriteToggle: (bookID: string) => void;
  onRatingChange: (bookId: string, newRating: number) => void;
};

export const BookList = ({
  books,
  onStatusChange,
  onFavouriteToggle,
  onRatingChange,
}: BookListProps) => {
  return (
    <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onStatusChange={onStatusChange}
          onFavouriteToggle={onFavouriteToggle}
          onRatingChange={onRatingChange}
        />
      ))}
    </ul>
  );
};

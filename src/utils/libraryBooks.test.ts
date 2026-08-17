import { describe, expect, it } from "vitest";
import type { Book } from "../types/book";
import {
  isBookSaved,
  mergeGuestBookIntoRemoteBook,
  mergePersonalDataIntoResults,
  updateBookRating,
  updateBookStatus,
} from "./libraryBooks";

const createBook = (overrides: Partial<Book> = {}): Book => ({
  id: "/works/OL1W",
  title: "Test book",
  author: "Test author",
  year: 2024,
  publisher: "Test publisher",
  coverUrl: "https://example.com/cover.jpg",
  pages: 250,
  status: "",
  isFavorite: false,
  rating: 0,
  ...overrides,
});

describe("library book rules", () => {
  it("clears the rating when a read book changes status", () => {
    const readBook = createBook({ status: "read", rating: 5 });

    expect(updateBookStatus(readBook, "reading").rating).toBe(0);
  });

  it("accepts ratings only for read books and keeps them between 0 and 5", () => {
    expect(updateBookRating(createBook(), 4).rating).toBe(0);
    expect(
      updateBookRating(createBook({ status: "read" }), 10).rating
    ).toBe(5);
  });

  it("keeps fresh search metadata and merges only personal fields", () => {
    const searchBook = createBook({ title: "Fresh title" });
    const savedBook = createBook({
      title: "Old title",
      status: "read",
      isFavorite: true,
      rating: 4,
    });

    const [mergedBook] = mergePersonalDataIntoResults(
      [searchBook],
      [savedBook]
    );

    expect(mergedBook.title).toBe("Fresh title");
    expect(mergedBook.status).toBe("read");
    expect(mergedBook.isFavorite).toBe(true);
    expect(mergedBook.rating).toBe(4);
  });

  it("merges guest favourites without replacing an account reading status", () => {
    const remoteBook = createBook({ status: "reading" });
    const guestBook = createBook({
      status: "read",
      isFavorite: true,
      rating: 5,
    });

    const mergedBook = mergeGuestBookIntoRemoteBook(
      remoteBook,
      guestBook
    );

    expect(mergedBook.status).toBe("reading");
    expect(mergedBook.isFavorite).toBe(true);
    expect(mergedBook.rating).toBe(0);
    expect(isBookSaved(mergedBook)).toBe(true);
  });
});

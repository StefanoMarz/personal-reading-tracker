import {
    useEffect,
    useState,
    type Dispatch,
    type SetStateAction,
  } from "react";
  import type {
    Book,
    LibrarySectionType,
    ReadingStatus,
  } from "../types/book";
  
  const LOCAL_STORAGE_KEY = "personal-reading-tracker-books";
  
  type UseLibraryProps = {
    searchResults: Book[];
    setSearchResults: Dispatch<SetStateAction<Book[]>>;
  };
  
  export const useLibrary = ({
    searchResults,
    setSearchResults,
  }: UseLibraryProps) => {
    const [libraryBooks, setLibraryBooks] = useState<Book[]>(() => {
      const savedBooks = localStorage.getItem(LOCAL_STORAGE_KEY);
  
      if (!savedBooks) {
        return [];
      }
  
      try {
        return JSON.parse(savedBooks) as Book[];
      } catch (error) {
        console.error("Unable to load the saved library:", error);
        return [];
      }
    });
  
    useEffect(() => {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(libraryBooks)
      );
    }, [libraryBooks]);
  
    const isBookSaved = (book: Book) =>
      book.status !== "" || book.isFavorite || book.rating > 0;
  
    const updateBookEverywhere = (
      bookId: string,
      updateBook: (book: Book) => Book
    ) => {
      const sourceBook =
        libraryBooks.find((book) => book.id === bookId) ??
        searchResults.find((book) => book.id === bookId);
  
      if (!sourceBook) {
        return;
      }
  
      const updatedBook = updateBook(sourceBook);
  
      setSearchResults((currentResults) =>
        currentResults.map((book) =>
          book.id === bookId ? updatedBook : book
        )
      );
  
      setLibraryBooks((currentLibrary) => {
        if (!isBookSaved(updatedBook)) {
          return currentLibrary.filter((book) => book.id !== bookId);
        }
  
        const alreadySaved = currentLibrary.some(
          (book) => book.id === bookId
        );
  
        if (alreadySaved) {
          return currentLibrary.map((book) =>
            book.id === bookId ? updatedBook : book
          );
        }
  
        return [...currentLibrary, updatedBook];
      });
    };
  
    const handleResetLibrary = () => {
      setLibraryBooks([]);
  
      setSearchResults((currentResults) =>
        currentResults.map((book) => ({
          ...book,
          status: "",
          isFavorite: false,
          rating: 0,
        }))
      );
    };
  
    const handleRemoveFromLibrarySection = (
      bookId: string,
      section: LibrarySectionType
    ) => {
      updateBookEverywhere(bookId, (book) => {
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
    };
  
    const handleStatusChange = (
      bookId: string,
      newStatus: ReadingStatus
    ) => {
      updateBookEverywhere(bookId, (book) => ({
        ...book,
        status: newStatus,
        rating: newStatus === "read" ? book.rating : 0,
      }));
    };
  
    const handleRatingChange = (
      bookId: string,
      newRating: number
    ) => {
      updateBookEverywhere(bookId, (book) => ({
        ...book,
        rating: newRating,
      }));
    };
  
    const handleFavoriteToggle = (bookId: string) => {
      updateBookEverywhere(bookId, (book) => ({
        ...book,
        isFavorite: !book.isFavorite,
      }));
    };
  
    return {
      libraryBooks,
      savedBooksCount: libraryBooks.length,
      wantToReadBooks: libraryBooks.filter(
        (book) => book.status === "want to read"
      ),
      readingBooks: libraryBooks.filter(
        (book) => book.status === "reading"
      ),
      readBooks: libraryBooks.filter(
        (book) => book.status === "read"
      ),
      favouriteBooks: libraryBooks.filter(
        (book) => book.isFavorite
      ),
      handleResetLibrary,
      handleRemoveFromLibrarySection,
      handleStatusChange,
      handleRatingChange,
      handleFavoriteToggle,
    };
  };
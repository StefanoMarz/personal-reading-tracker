import { useEffect, useRef, useState } from "react";
import type { Book } from "../types/book";
import { getRecommendedBooks } from "../services/booksApi";
import { RecommendedBookCard } from "./RecommendedBookCard";

type RecommendedBooksProps = {
  onBookClick: (book: Book) => void;
};

export const RecommendedBooks = ({ onBookClick }: RecommendedBooksProps) => {
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Mantiene il riferimento al contenitore orizzontale del carousel.
  const carouselRef = useRef<HTMLDivElement>(null);

  // Recupera i libri consigliati quando il componente viene caricato.
  useEffect(() => {
    const loadRecommendedBooks = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        const books = await getRecommendedBooks();
        setRecommendedBooks(books);
      } catch (error) {
        console.error("Impossibile caricare i libri consigliati:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    void loadRecommendedBooks();
  }, []);

  // Sposta il carousel nella direzione indicata.
  const scrollCarousel = (direction: "left" | "right") => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const scrollAmount = direction === "left" ? -300 : 300;

    carousel.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  // Fa avanzare automaticamente il carousel ogni pochi secondi.
  useEffect(() => {
    if (isPaused || recommendedBooks.length === 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const carousel = carouselRef.current;

      if (!carousel) {
        return;
      }

      const reachedEnd =
        carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10;

      if (reachedEnd) {
        carousel.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        carousel.scrollBy({
          left: 180,
          behavior: "smooth",
        });
      }
    }, 3000);

    // Interrompe l'intervallo quando il componente cambia o viene rimosso.
    return () => window.clearInterval(intervalId);
  }, [isPaused, recommendedBooks]);

  if (isLoading) {
    return (
      <section className="mt-10">
        <p className="text-sm text-slate-400">Loading recommended books...</p>
      </section>
    );
  }

  if (hasError || recommendedBooks.length === 0) {
    return null;
  }

  return (
    <section
      className="mt-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-violet-300">
            Discover
          </p>

          <h2 className="mt-1 text-2xl font-bold text-white">
            Recommended books
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollCarousel("left")}
            className="flex size-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xl text-slate-300 transition hover:border-violet-500 hover:text-white"
            aria-label="Scroll recommended books left"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => scrollCarousel("right")}
            className="flex size-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xl text-slate-300 transition hover:border-violet-500 hover:text-white"
            aria-label="Scroll recommended books right"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {recommendedBooks.map((book) => (
          <RecommendedBookCard
            key={book.id}
            book={book}
            onBookClick={onBookClick}
          />
        ))}
      </div>
    </section>
  );
};

import type { FormEvent } from "react";
import type { SearchBy } from "../services/booksApi";

type SearchFormProps = {
  search: string;
  searchBy: SearchBy;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onSearchByChange: (value: SearchBy) => void;
  onSubmit: () => void;
};

export const SearchForm = ({
  search,
  searchBy,
  isLoading,
  onSearchChange,
  onSearchByChange,
  onSubmit,
}: SearchFormProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-violet-500/20 bg-slate-900 p-4 shadow-lg shadow-black/20"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={searchBy}
          onChange={(event) =>
            onSearchByChange(event.target.value as SearchBy)
          }
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none sm:w-28"
          aria-label="Search books by"
        >
          <option value="title">Title</option>
          <option value="author">Author</option>
        </select>

        <input
          type="text"
          placeholder={
            searchBy === "title"
              ? "Search a book title..."
              : "Search an author..."
          }
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500"
        />

        <button
          type="submit"
          disabled={search.trim() === "" || isLoading}
          className="w-full rounded-xl bg-violet-600 px-5 py-3 font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
};
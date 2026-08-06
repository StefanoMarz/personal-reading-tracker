# Personal Reading Tracker

Personal Reading Tracker is a responsive web application built with React, TypeScript, Tailwind CSS, and Vite.

The application allows users to search for books through the Open Library API, manage a personal reading library, assign reading statuses, rate completed books, and save their favourite titles.

The project was created as part of my frontend development portfolio to practise React, TypeScript, API integration, state management, data persistence, and component-based application design.

## Live Demo

[View the live application](https://personal-reading-tracker-blue.vercel.app/)

## Features

- Search for books by title or author
- Retrieve real book data from the Open Library API
- Display search results in responsive cards
- View information about each book:
  - Cover image
  - Title
  - Author
  - Publication year
  - Publisher
  - Number of pages
- Assign a reading status:
  - Want to read
  - Reading
  - Read
- Rate completed books from 1 to 5 stars
- Restrict ratings to books marked as `Read`
- Add or remove books from favourites
- Keep the personal library separate from search results
- Persist the personal library using `localStorage`
- Automatically restore saved statuses, ratings, and favourites in new search results
- Browse the personal library through a dedicated sidebar
- Organise saved books into the following sections:
  - Want to read
  - Reading
  - Read
  - Favourites
- Expand and collapse library sections
- Remove individual books from a specific library section
- Reset the entire personal library
- Browse recommended books through a carousel
- Automatically scroll the recommendation carousel
- Navigate the carousel manually
- Pause automatic scrolling while hovering over the carousel
- Start a title search by selecting a recommended book
- Use the search form by clicking the button or pressing Enter
- Use the application across desktop and mobile devices

## Technology Stack

- React
- TypeScript
- Tailwind CSS
- Vite
- Open Library API
- Browser `localStorage`
- ESLint
- Vercel

## Concepts Practised

During the development of this project, I worked with:

- React components
- Typed component props
- Custom hooks
- Separation of concerns
- Controlled inputs
- Form submission
- Event handling
- `useState`
- `useEffect`
- `useRef`
- Application state management
- Separation between search results and the personal library
- Arrays of objects
- `map`, `filter`, `find`, and `some`
- Conditional rendering
- Functions passed as props
- Immutable state updates
- API requests with `fetch`
- `async` and `await`
- Loading and error states
- Transformation of external API data
- TypeScript types
- Fallback values for missing API data
- Data persistence with `localStorage`
- Timers with `setInterval`
- React effect cleanup
- Horizontal scrolling with DOM references
- Responsive layouts with Tailwind CSS
- Git branches and pull requests
- Production builds and deployment

## Project Structure

```text
src/
  components/
    BookCard.tsx
    BookList.tsx
    LibrarySection.tsx
    LibrarySidebar.tsx
    RecommendedBookCard.tsx
    RecommendedBooks.tsx
    SearchForm.tsx
  hooks/
    useLibrary.ts
  services/
    booksApi.ts
  types/
    book.ts
  App.tsx
  main.tsx
  index.css
```

## Application Architecture

The application separates its main responsibilities into components, services, types, and custom hooks.

### Components

The user interface is divided into reusable components responsible for displaying search results, individual book cards, recommendations, the search form, and the personal library sidebar.

### API service

The `booksApi.ts` service handles communication with the Open Library API and converts external data into the internal `Book` type used by the application.

### Library hook

The `useLibrary` custom hook manages:

- The personal library state
- Reading statuses
- Ratings
- Favourites
- Library sections
- Library reset
- Synchronisation with search results
- Persistence through `localStorage`

This keeps library-related logic separate from the main `App` component.

## Open Library API

The application uses the Open Library Search API.

Example endpoint for a title search:

```text
https://openlibrary.org/search.json?title=harry%20potter&limit=12
```

The returned data is transformed into the internal `Book` type so that the rest of the application can work with a consistent and predictable structure.

Fallback values are used when information such as the author, publisher, publication year, page count, or cover image is unavailable.

## Data Persistence

Search results and the personal library are managed separately.

Search results returned by the API are stored in the `searchResults` state.

The `useLibrary` custom hook manages the `libraryBooks` state, library operations, and data persistence.

Only books containing personal information are stored in `localStorage`. This includes books with:

- A reading status
- A rating
- Favourite status

Starting a new search does not remove previously saved books.

When a saved book appears again in the search results, the application automatically restores its:

- Reading status
- Rating
- Favourite status

## Running the Project Locally

Clone the repository:

```bash
git clone https://github.com/StefanoMarz/personal-reading-tracker.git
```

Open the project directory:

```bash
cd personal-reading-tracker
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

## Planned Improvements

- Add a detailed book page or modal
- Add personal notes and reviews
- Add reading progress tracking
- Add start and completion dates
- Add library filters and sorting
- Add reading statistics and yearly goals
- Improve keyboard navigation and accessibility
- Add automated tests for components and application logic
- Replace `localStorage` with a Node.js backend and PostgreSQL database
- Add user authentication
- Provide a separate personal library for each registered user

## Project Goal

The main objective of this project is to demonstrate my ability to build a complete frontend application using React and TypeScript.

The application combines reusable components, external API integration, state management, data transformation, persistence, responsive design, and structured application logic.

It will later be expanded into a full-stack application using Node.js and PostgreSQL.

## Author

Created by Stefano Marzella as part of my professional development journey in frontend and full-stack web development.
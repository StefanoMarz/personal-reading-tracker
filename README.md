# Personal Reading Tracker

Personal Reading Tracker is a responsive React and TypeScript application with authentication and per-user PostgreSQL persistence powered by Supabase.

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
- Use the full application without registering through guest mode
- Persist the guest library using `localStorage`
- Create an account and sign in with email and password
- Edit first name, last name, and email
- Persist a separate library for each registered user with Supabase
- Import and merge a guest library into a registered account
- Protect user data with PostgreSQL Row Level Security policies
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
- Supabase Auth and Data API
- PostgreSQL
- SQL migrations and Row Level Security
- ESLint
- Vitest
- React Testing Library
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
- Authentication and browser sessions
- CRUD operations through the Supabase Data API
- PostgreSQL tables, constraints, grants, and RLS policies
- Guest/account data migration and conflict resolution
- Component and domain-logic testing
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
    AuthDialog.tsx
    LibrarySection.tsx
    LibrarySidebar.tsx
    ProfileDialog.tsx
    RecommendedBookCard.tsx
    RecommendedBooks.tsx
    SearchForm.tsx
  hooks/
    useAuth.ts
    useLibrary.ts
  lib/
    supabase.ts
  services/
    booksApi.ts
    libraryApi.ts
  test/
    setup.ts
  types/
    book.ts
  utils/
    libraryBooks.ts
  App.tsx
  main.tsx
  index.css
supabase/
  migrations/
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
- Guest persistence through `localStorage`
- Remote persistence through Supabase for authenticated users
- Guest-library import and merging

This keeps library-related logic separate from the main `App` component.

## Open Library API

The application uses the Open Library Search API.

Example endpoint for a title search:

```text
https://openlibrary.org/search.json?title=harry%20potter&limit=12
```

The returned data is transformed into the internal `Book` type so that the rest of the application can work with a consistent and predictable structure.

Fallback values are used when information such as the author, publisher, publication year, page count, or cover image is unavailable.

## Authentication and Data Persistence

Search results and the personal library are managed separately.

Search results returned by the API are stored in the `searchResults` state.

The `useAuth` hook manages registration, login, logout, profile updates, and session restoration through Supabase Auth.

The `useLibrary` custom hook manages `libraryBooks`, library operations, and the active persistence mode:

- Guests store their library in browser `localStorage`.
- Authenticated users read and write their library in the PostgreSQL `library_books` table.
- When a guest signs in, the application can import and merge local books without blindly replacing existing account data.

The `libraryApi.ts` service contains the database mapping and CRUD operations. Database responses are validated at runtime before being converted to the internal `Book` type.

Row Level Security policies compare every row's `user_id` with the authenticated user ID. Users can therefore read and modify only their own library.

Only books containing personal information are persisted. This includes books with:

- A reading status
- A rating
- Favourite status

Starting a new search does not remove previously saved books. Fresh Open Library metadata stays separate from personal fields such as status, rating, and favourite membership.

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

Copy `.env.example` to `.env.local` and add the Supabase project URL and publishable key:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Apply the SQL migration in `supabase/migrations` to the Supabase project and configure the local authentication redirect URL as `http://localhost:5173/**`.

Start the development server:

```bash
npm run dev
```

Run ESLint:

```bash
npm run lint
```

Run the automated tests:

```bash
npm run test
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
- Add reading statistics and yearly goals
- Add sorting and filtering to the saved library
- Add password recovery
- Configure a production email provider for authentication emails
- Expand the automated test coverage for remote failures
- Build a separate small Node.js API project to practise custom backend fundamentals

## Project Goal

The main objective of this project is to demonstrate my ability to build a complete frontend application using React and TypeScript while integrating a real backend service and relational database.

The application combines reusable components, external API integration, authentication, server-state synchronization, SQL migrations, secure per-user persistence, testing, responsive design, and structured application logic.

## Author

Created by Stefano Marzella as part of my professional development journey in frontend and full-stack web development.

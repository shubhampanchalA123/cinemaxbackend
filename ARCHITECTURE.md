# Movie API Architecture Documentation

## Overview
This project fetches movie data from multiple third-party APIs (TMDB, OMDB) and provides a unified API to the frontend.

## Architecture Flow

```
Client Request
    │
    ▼
┌─────────────────────────────────────────────┐
│           Routes (routes/)                    │
│  movies.js, tv.js, auth.js               │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│       Controllers (controllers/)              │
│  movieController.js, authController.js       │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│   Movie Aggregator (services/)             │
│  movieAggregator.js                   │
│  - getPopular(), getSearch(), etc.    │
└──────────────────┬──────────────────────┘
                   │
         ┌─────────┼─────────┐
         ▼         ▼         ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   TMDB     │ │   OMDB    │ │ Future   │
│  Adapter   │ │  Adapter  │ │ APIs    │
│(tmdbAdapter│(omdbAdapter│ │         │
│  .js)     │  .js)     │ │         │
└─────┬─────┘ └─────┬─────┘ └─────┬─────┘
      │            │            │
      ▼            ▼            ▼
TMDB API      OMDB API    [New API]
```

## Key Files and Their Purpose

### 1. Provider Adapters (services/providers/)
Each third-party API has its own adapter class that implements a common interface.

| File | Purpose |
|------|--------|
| `baseProvider.js` | Abstract interface - defines methods all providers must implement |
| `tmdbAdapter.js` | TMDB API adapter - fetches from themoviedb.org |
| `omdbAdapter.js` | OMDB API adapter - fetches from omdbapi.com |
| `movieProviderFactory.js` | Factory - creates provider instances |

**Base Provider Interface:**
```javascript
class BaseMovieProvider {
  getPopular(page)
  getTrending()
  getDetails(id)
  getVideos(id)
  search(query, page)
  getTopRated(page)
  getSimilar(id)
  normalizeMovie()     // Converts API response to standard format
  normalizeMovieDetail()
}
```

**Standardized Response Format:**
```javascript
{
  id: "123",
  tmdbId: "123",
  imdbId: "tt123",
  title: "Movie Title",
  original_title: "Original Title",
  overview: "Plot...",
  poster_path: "https://...",
  backdrop_path: "https://...",
  release_date: "2024-01-01",
  vote_average: 7.5,
  vote_count: 1000,
  genre_ids: [28, 12],
  provider: "TMDB"  // Added by normalizer
}
```

### 2. Movie Aggregator (services/movieAggregator.js)
Combines data from multiple providers into a single response.

**Key Methods:**
| Method | Description |
|--------|-----------|
| `getPopular({ page, providers, merged })` | Fetches popular movies |
| `getTrending()` | Fetches trending movies |
| `search(query, { page, providers, merged })` | Searches movies |
| `getDetails(id)` | Gets movie details |
| `getMovieById(imdbId)` | Gets movie by IMDB ID |
| `mergeMovies()` | Combines results from different providers |

**Merged Response:**
```javascript
{
  page: 1,
  total_results: 1124558,
  results: [
    { provider: "TMDB", title: "Avatar", ... },
    { provider: "OMDB", title: "Avatar", ... },
    ...
  ]
}
```

### 3. Controllers (controllers/)
Handle HTTP requests and call aggregator methods.

| File | Endpoints |
|------|----------|
| `movieController.js` | `/api/movies/*` |
| `authController.js` | `/api/auth/*` |

### 4. Routes (routes/)
Define API endpoints.

```
/api/movies/popular?page=1&merged=true
/api/movies/trending
/api/movies/search?q=query
/api/movies/top_rated
/api/movies/:id
/api/movies/:id/similar
/api/movies/imdb/:imdbId
```

## Adding a New Provider

To add a new third-party API (e.g., IMDb API):

1. **Create Adapter:**
```javascript
// services/providers/imdbAdapter.js
const BaseProvider = require('./baseProvider');
class IMDBProvider extends BaseProvider {
  constructor() {
    super('IMDB');
    this.baseUrl = 'https://api.imdb.com';
    this.apiKey = process.env.IMDB_API_KEY;
  }
  // Implement all BaseProvider methods...
}
module.exports = IMDBProvider;
```

2. **Register in Factory:**
```javascript
// services/providers/movieProviderFactory.js
const IMDBProvider = require('./imdbAdapter');
const PROVIDERS = { TMDB, OMDB, IMDB };
```

3. **Update Controller:**
The new provider is automatically used when you specify `?providers=IMDB` in the request.

## Data Flow Example

### Request: `GET /api/movies/search?q=avatar&merged=true`

```
1. Request hits movieController.js → searchMovies()
2. movieController calls movieAggregator.search('avatar', { merged: true })
3. movieAggregator loops through providers ['TMDB', 'OMDB']
4. For TMDB: calls tmdbProvider.search() → calls TMDB API
5. For OMDB: calls omdbProvider.search() → calls OMDB API
6. Each provider normalizes data to standard format
7. movieAggregator.mergeMovies() combines all results
8. Returns merged array to controller
9. Controller sends JSON response to client
```

## Configuration

Environment variables in `.env`:
```
TMDB_API_KEY=your_tmdb_key
OMDB_API_KEY=your_omdb_key
JWT_SECRET=your_jwt_secret
MONGO_URI=mongodb://localhost:27017/movieapp
REDIS_URL=redis://localhost:6379
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_password
```

## Caching
Redis is used for caching API responses to reduce third-party API calls.

## Authentication Flow

```
1. POST /api/auth/signup
   - Create user, send OTP to email
   - Return userId and OTP

2. POST /api/auth/verify
   - Verify OTP
   - Return JWT token

3. POST /api/auth/login
   - Check credentials + isVerified
   - Return JWT token

4. Protected Routes
   - Use Authorization: Bearer <token>
   - Verify JWT, check user exists
```

## Summary

This architecture follows the **Adapter Pattern** + **Factory Pattern**:
- **Adapter Pattern**: Each API has a standardized interface
- **Factory Pattern**: Factory creates provider instances
- **Aggregator Pattern**: Combines results from multiple sources
- This makes it easy to add/remove providers without changing the main logic
# Movie Backend

A production-ready Node.js backend for a movie browsing application using TMDB API.

## Features

- Movie data via TMDB API (popular, trending, details, videos, search)
- User authentication with JWT
- User watchlist management
- Redis caching for API responses
- Rate limiting and security middlewares
- Centralized error handling

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   - `TMDB_API_KEY`: Your TMDB API key
   - `JWT_SECRET`: A secret key for JWT
   - `MONGO_URI`: MongoDB connection string
   - `REDIS_URL`: Redis connection URL
   - `PORT`: Server port (default 5000)

3. Ensure MongoDB and Redis are running locally or update URIs accordingly.

4. Start the server:
   ```bash
   npm start
   ```

   For development:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Movies
- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/:id` - Get movie details
- `GET /api/movies/:id/videos` - Get movie videos
- `GET /api/movies/search?q=query` - Search movies

### Users (requires auth)
- `GET /api/users/watchlist` - Get user watchlist
- `POST /api/users/watchlist` - Add movie to watchlist
- `DELETE /api/users/watchlist/:movieId` - Remove from watchlist

### Health
- `GET /api/health` - Health check

## Architecture

- **controllers/**: Route handlers
- **routes/**: Express routes
- **services/**: Business logic (TMDB API)
- **models/**: Mongoose models
- **middlewares/**: Custom middlewares
- **utils/**: Utility functions
- **config/**: Database and Redis config
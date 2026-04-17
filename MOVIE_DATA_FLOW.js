/**
 * ============================================================
 *        MOVIE DATA MULTI-API FLOW (TMDB + OMDB)
 * ============================================================
 * 
 * Ye file samjhayega kaise multiple APIs se data fetch karte hain.
 * 
 * ============================================================
 */


/**
 * ┌─────────────────────────────────────────────────────────┐
 * │                    CLIENT REQUEST                       │
 * └──────────────────────┬────────────────────────────────┘
 *                        │
 *                        ▼
 * ┌─────────────────────────────────────────────────────────┐
 * │  routes/movies.js                                 │
 * │  router.get('/popular', getPopularMovies);             │
 * │  router.get('/search', searchMovies);            │
 * └──────────────────────┬────────────────────────────────┘
 *                        │
 *                        ▼
 * ┌─────────────────────────────────────────────────────────┐
 * │  controllers/movieController.js                     │
 * │  getPopularMovies() {                           │
 * │    movieAggregator.getPopular({merged:true}) │
 * │  }                                        │
 * └──────────────────────┬────────────────────────────────┘
 *                        │
 *                        ▼
 * ┌─────────────────────────────────────────────────────────┐
 * │  services/movieAggregator.js                   │ ◄── MAIN FILE
 * │  getPopular({merged, providers})           │
 * └──────────────────────┬────────────────────────────────┘
 *                        │
 *         ┌──────────────┼──────────────┐
 *         ▼              ▼              ▼
 * ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
 * │   TMDB    │ │   OMDB    │ │  Future   │
 * │ Provider  │ │ Provider  │ │  APIs    │
 * └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
 *       │            │            │
 *       ▼            ▼            ▼
 *  TMDB API     OMDB API    [New API URL]
 */


/**
 * ============================================================
 * STEP BY STEP FLOW
 * ============================================================
 */


/**
 * CLIENT REQUEST:
 * GET /api/movies/search?q=avatar&merged=true
 */
 


/**
 * STEP 1: routes/movies.js
 * --------------------
 * Request yaha enter hoti hai
 */
router.get('/search', searchMovies);
// URL: /api/movies/search?q=avatar&merged=true



/**
 * STEP 2: controllers/movieController.js
 * ---------------------------------
 * Controller function request handle karta hai
 */
const searchMovies = async (req, res) => {
  const { q: query, page = 1, providers } = req.query;
  const merged = req.query.merged === 'false' ? false : true;  // Default true
  
  const providerList = providers?.split(',') || ['TMDB', 'OMDB'];
  
  // Call aggregator with merged=true
  const data = await movieAggregator.search(query, { 
    page: parseInt(page), 
    providers: providerList, 
    merged 
  });
  
  res.json(data);  // Send response
};


/**
 * STEP 3: services/movieAggregator.js
 * --------------------------------
 * Yaha sab providers se data fetch hota hai aur merge hota hai
 */
class MovieAggregator {
  
  async search(query, options = {}) {
    const { page = 1, providers = this.providers, merged = false } = options;
    const results = {};  // Store each provider's data

    // Call ALL providers in parallel
    const providerPromises = providers.map(async (providerName) => {
      try {
        // 1. Get provider from factory
        const provider = factory.getProvider(providerName);
        
        // 2. Call provider's search method
        const data = await provider.search(query, page);
        
        // 3. Store normalized data
        if (providerName === 'TMDB') {
          results[providerName] = {
            page: data.page,
            total_pages: data.total_pages,
            total_results: data.total_results,
            movies: data.results?.map(m => provider.normalizeMovie(m)) || [],
          };
        } else if (providerName === 'OMDB') {
          results[providerName] = {
            page: page,
            total_pages: Math.ceil((parseInt(data.totalResults) || 0) / 10),
            total_results: parseInt(data.totalResults) || 0,
            movies: data.Search?.map(m => provider.normalizeMovie(m)) || [],
          };
        }
      } catch (error) {
        results[providerName] = { error: error.message, movies: [] };
      }
    });

    // Wait for all providers
    await Promise.all(providerPromises);

    // If merged=true, combine all results
    if (merged) {
      return this.mergeMovies(results);  // <-- See below
    }
    
    return { results };
  }


  // COMBINE MULTIPLE PROVIDER DATA
  mergeMovies(results) {
    const allMovies = [];
    let totalResults = 0;

    // Loop through each provider's results
    Object.keys(results).forEach(provider => {
      if (results[provider].movies) {
        allMovies.push(...results[provider].movies);
        totalResults += results[provider].total_results || 0;
      }
    });

    // Return single merged array
    return {
      page: 1,
      total_results: totalResults,
      results: allMovies,  // <-- Combined array!
    };
  }
}


/**
 * STEP 4: services/providers/movieProviderFactory.js
 * ---------------------------------------
 * Factory - provider instances create karta hai
 */
class MovieProviderFactory {
  getProvider(name) {
    const providerClass = PROVIDERS[name.toUpperCase()];
    if (!providerClass) {
      throw new Error(`Provider ${name} not supported`);
    }
    if (!this.instances[name]) {
      this.instances[name] = new providerClass();
    }
    return this.instances[name];
  }
}

const PROVIDERS = {
  TMDB: TMDBProvider,
  OMDB: OMDBProvider,
};


/**
 * STEP 5: services/providers/tmdbAdapter.js
 * ----------------------------------
 * TMDB API se data fetch karta hai
 */
class TMDBProvider extends BaseMovieProvider {
  constructor() {
    super('TMDB');
    this.baseUrl = 'https://api.themoviedb.org/3';
    this.apiKey = process.env.TMDB_API_KEY;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      params: { api_key: this.apiKey },
    });
  }

  async search(query, page = 1) {
    return this.fetch('/search/movie', { query, page });
  }

  async fetch(endpoint, params = {}) {
    // Check Redis cache
    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    // Call TMDB API
    const response = await this.client.get(endpoint, { params });
    const data = response.data;
    
    // Cache result
    await setCachedData(cacheKey, data);
    return data;
  }

  // Convert TMDB data to STANDARD format
  normalizeMovie(movie) {
    return {
      id: movie.id?.toString(),
      tmdbId: movie.id?.toString(),
      imdbId: movie.imdb_id || null,
      title: movie.title,
      original_title: movie.original_title,
      overview: movie.overview,
      poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      // ... standard fields
      provider: 'TMDB',  // <-- Tag so we know which API
    };
  }
}


/**
 * STEP 6: services/providers/omdbAdapter.js
 * ----------------------------------
 * OMDB API se data fetch karta hai
 */
class OMDBProvider extends BaseMovieProvider {
  constructor() {
    super('OMDB');
    this.baseUrl = 'http://www.omdbapi.com';
    this.apiKey = process.env.OMDB_API_KEY;
  }

  async search(query, page = 1) {
    return this.fetch({ s: query, type: 'movie', page: 1 });
  }

  async fetch(params) {
    // Check cache
    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    // Call OMDB API
    const response = await this.client.get('/', { 
      params: { ...params, apikey: this.apiKey } 
    });
    
    if (response.data.Response === 'False') {
      throw new Error(response.data.Error);
    }
    
    await setCachedData(cacheKey, response.data);
    return response.data;
  }

  // Convert OMDB data to STANDARD format
  normalizeMovie(movie) {
    return {
      id: movie.imdbID,
      imdbId: movie.imdbID,
      title: movie.Title,
      poster_path: movie.Poster !== 'N/A' ? movie.Poster : null,
      release_date: movie.Year !== 'N/A' ? `${movie.Year}-01-01` : null,
      // ... standard fields (some fields may be null for OMDB)
      provider: 'OMDB',  // <-- Tag so we know which API
    };
  }
}


/**
 * ============================================================
 * FINAL RESPONSE EXAMPLE
 * ============================================================
 * 
 * GET /api/movies/search?q=avatar&merged=true
 * 
 * Response:
 * {
 *   "page": 1,
 *   "total_results": 704,
 *   "results": [
 *     {
 *       "id": "tt0499549",
 *       "imdbId": "tt0499549", 
 *       "title": "Avatar",
 *       "poster_path": "https://m.media-amazon.com/...",
 *       "provider": "OMDB"
 *     },
 *     {
 *       "id": "19995",
 *       "tmdbId": "19995",
 *       "title": "Avatar", 
 *       "poster_path": "https://image.tmdb.org/...",
 *       "provider": "TMDB"
 *     },
 *     ...
 *   ]
 * }
 */


/**
 * ============================================================
 * KEY FILES SUMMARY
 * ============================================================
 * 
 * services/
 * ├── movieAggregator.js      ◄── Data merge karta hai is file me
 * │   ├── getPopular()    ◄── Popular movies
 * │   ├── getTrending()  ◄── Trending movies  
 * │   ├── search()      ◄── Search movies
 * │   └── mergeMovies()  ◄── Combine provider results
 * │
 * └── providers/
 *     ├── baseProvider.js          ◄── Interface (abstract class)
 *     ├── tmdbAdapter.js     ◄── TMDB API adapter
 *     ├── omdbAdapter.js    ◄── OMDB API adapter
 *     └── movieProviderFactory.js ◄── Creates provider instances
 * 
 * Flow: Controller → Aggregator → Factory → Adapters → External APIs
 */


/**
 * ============================================================
 * NEW API ADD KARNE KA PROCESS
 * ============================================================
 * 
 * 1. Create new adapter:
 *    services/providers/newApiAdapter.js
 *    2. Add to factory:
 *    services/providers/movieProviderFactory.js me:
 *        const NEWAPI = require('./newApiAdapter');
 *        const PROVIDERS = { TMDB, OMDB, NEWAPI };
 *    3. Auto use ho jayega!
 */

module.exports = 'Movie Data Flow Documentation';
const axios = require('axios');
const BaseMovieProvider = require('./baseProvider');
const { getCachedData, setCachedData } = require('../../utils/cache');

class OMDBProvider extends BaseMovieProvider {
  constructor() {
    super('OMDB');
    this.baseUrl = 'http://www.omdbapi.com';
    this.apiKey = process.env.OMDB_API_KEY;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
    });
  }

  async fetch(params) {
    const cacheKey = `omdb:${JSON.stringify(params)}`;
    
    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get('/', { params: { ...params, apikey: this.apiKey } });
    
    if (response.data.Response === 'False') {
      throw new Error(response.data.Error || 'OMDB API error');
    }
    
    await setCachedData(cacheKey, response.data);
    return response.data;
  }

  async search(query, page = 1) {
    const pageSize = 10;
    const start = (page - 1) * pageSize;
    
    const result = await this.fetch({
      s: query,
      type: 'movie',
      page: 1
    });

    if (!result.Search) return { Search: [], totalResults: 0 };

    const paginatedResults = result.Search.slice(start, start + pageSize);
    
    return {
      Search: paginatedResults,
      totalResults: result.totalResults,
      Response: result.Response
    };
  }

  async getDetails(imdbId) {
    return this.fetch({
      i: imdbId,
      plot: 'full'
    });
  }

  async getById(imdbId) {
    return this.fetch({
      i: imdbId,
      plot: 'full'
    });
  }

  normalizeMovie(movie) {
    return {
      id: movie.imdbID,
      imdbId: movie.imdbID,
      title: movie.Title,
      original_title: movie.Title,
      overview: null,
      poster_path: movie.Poster !== 'N/A' ? movie.Poster : null,
      backdrop_path: null,
      release_date: movie.Year !== 'N/A' ? `${movie.Year}-01-01` : null,
      vote_average: movie.imdbRating !== 'N/A' ? parseFloat(movie.imdbRating) * 2 : null,
      vote_count: null,
      popularity: null,
      genre_ids: [],
      genres: movie.Genre ? movie.Genre.split(', ').map(g => g.trim()) : [],
      type: movie.Type,
      provider: 'OMDB',
    };
  }

  normalizeMovieDetail(movie) {
    return {
      id: movie.imdbID,
      imdbId: movie.imdbID,
      title: movie.Title,
      original_title: movie.Title,
      overview: movie.Plot !== 'N/A' ? movie.Plot : null,
      poster_path: movie.Poster !== 'N/A' ? movie.Poster : null,
      backdrop_path: null,
      release_date: movie.Released !== 'N/A' ? movie.Released : null,
      runtime: movie.Runtime !== 'N/A' ? parseInt(movie.Runtime) : null,
      status: movie.Type,
      tagline: null,
      budget: null,
      revenue: null,
      vote_average: movie.imdbRating !== 'N/A' ? parseFloat(movie.imdbRating) * 2 : null,
      vote_count: movie.imdbVotes !== 'N/A' ? parseInt(movie.imdbVotes.replace(/,/g, '')) : null,
      popularity: null,
      genres: movie.Genre ? movie.Genre.split(', ').map(g => g.trim()) : [],
      director: movie.Director !== 'N/A' ? movie.Director.split(', ') : [],
      writer: movie.Writer !== 'N/A' ? movie.Writer.split(', ') : [],
      actors: movie.Actors !== 'N/A' ? movie.Actors.split(', ') : [],
      country: movie.Country !== 'N/A' ? movie.Country.split(', ') : [],
      language: movie.Language !== 'N/A' ? movie.Language.split(', ') : [],
      provider: 'OMDB',
    };
  }
}

module.exports = OMDBProvider;
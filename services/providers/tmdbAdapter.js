const axios = require('axios');
const BaseMovieProvider = require('./baseProvider');
const { getCachedData, setCachedData } = require('../../utils/cache');

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

  async fetch(endpoint, params = {}) {
    const cacheKey = `tmdb:${endpoint}:${JSON.stringify(params)}`;
    
    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(endpoint, { params });
    await setCachedData(cacheKey, response.data);
    return response.data;
  }

  async getPopular(page = 1) {
    return this.fetch('/movie/popular', { page });
  }

  async getTrending() {
    return this.fetch('/trending/movie/week');
  }

  async getDetails(id) {
    return this.fetch(`/movie/${id}`);
  }

  async getVideos(id) {
    return this.fetch(`/movie/${id}/videos`);
  }

  async search(query, page = 1) {
    return this.fetch('/search/movie', { query, page });
  }

  async getTopRated(page = 1) {
    return this.fetch('/movie/top_rated', { page });
  }

  async getSimilar(id, page = 1) {
    return this.fetch(`/movie/${id}/similar`, { page });
  }

  async getById(tmdbId) {
    return this.fetch(`/movie/${tmdbId}`);
  }

  normalizeMovie(movie) {
    return {
      id: movie.id?.toString(),
      tmdbId: movie.id?.toString(),
      imdbId: movie.imdb_id || null,
      title: movie.title,
      original_title: movie.original_title,
      overview: movie.overview,
      poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      popularity: movie.popularity,
      genre_ids: movie.genre_ids || [],
      adult: movie.adult,
      original_language: movie.original_language,
      provider: 'TMDB',
    };
  }

  normalizeMovieDetail(movie) {
    return {
      id: movie.id?.toString(),
      tmdbId: movie.id?.toString(),
      imdbId: movie.imdb_id || null,
      title: movie.title,
      original_title: movie.original_title,
      overview: movie.overview,
      poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
      release_date: movie.release_date,
      runtime: movie.runtime,
      status: movie.status,
      tagline: movie.tagline,
      budget: movie.budget,
      revenue: movie.revenue,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      popularity: movie.popularity,
      genres: movie.genres?.map(g => g.name) || [],
      production_companies: movie.production_companies?.map(c => c.name) || [],
      spoken_languages: movie.spoken_languages?.map(l => l.english_name) || [],
      provider: 'TMDB',
    };
  }
}

module.exports = TMDBProvider;
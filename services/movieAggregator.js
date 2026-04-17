const { factory } = require('./providers');

class MovieAggregator {
  constructor() {
    this.providers = ['TMDB', 'OMDB'];
  }

  async getPopular(options = {}) {
    const { page = 1, providers = this.providers, merged = false } = options;
    const results = {};

    const providerPromises = providers.map(async (providerName) => {
      try {
        const provider = factory.getProvider(providerName);
        const data = await provider.getPopular(page);
        
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
            total_pages: Math.ceil(data.totalResults / 10),
            total_results: parseInt(data.totalResults) || 0,
            movies: data.Search?.map(m => provider.normalizeMovie(m)) || [],
          };
        }
      } catch (error) {
        results[providerName] = { error: error.message, movies: [] };
      }
    });

    await Promise.all(providerPromises);

    if (merged) {
      return this.mergeMovies(results);
    }
    return { results };
  }

  mergeMovies(results) {
    const allMovies = [];
    let totalResults = 0;

    Object.keys(results).forEach(provider => {
      if (results[provider].movies) {
        allMovies.push(...results[provider].movies);
        totalResults += results[provider].total_results || 0;
      }
    });

    return {
      page: 1,
      total_results: totalResults,
      results: allMovies,
    };
  }

  async getTrending(options = {}) {
    const results = [];
    
    const tmdbProvider = factory.getProvider('TMDB');
    try {
      const data = await tmdbProvider.getTrending();
      return {
        page: 1,
        total_results: data.total_results || data.results?.length || 0,
        results: data.results?.map(m => tmdbProvider.normalizeMovie(m)) || [],
      };
    } catch (error) {
      return { page: 1, total_results: 0, results: [] };
    }
  }

  async getDetails(id, options = {}) {
    const { providers = this.providers } = options;
    
    const tmdbProvider = factory.getProvider('TMDB');
    try {
      const data = await tmdbProvider.getDetails(id);
      return tmdbProvider.normalizeMovieDetail(data);
    } catch (error) {
      return null;
    }
  }

  async getVideos(id) {
    const tmdbProvider = factory.getProvider('TMDB');
    try {
      const data = await tmdbProvider.getVideos(id);
      return {
        id: id,
        videos: data.results?.map(v => ({
          id: v.id,
          key: v.key,
          name: v.name,
          site: v.site,
          type: v.type,
        })) || [],
      };
    } catch (error) {
      return { id: id, videos: [] };
    }
  }

  async search(query, options = {}) {
    const { page = 1, providers = this.providers, merged = false } = options;
    const results = {};

    const providerPromises = providers.map(async (providerName) => {
      try {
        const provider = factory.getProvider(providerName);
        const data = await provider.search(query, page);
        
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

    await Promise.all(providerPromises);

    if (merged) {
      return this.mergeMovies(results);
    }
    return { results };
  }

  async getTopRated(options = {}) {
    const { page = 1, providers = this.providers } = options;
    
    const tmdbProvider = factory.getProvider('TMDB');
    try {
      const data = await tmdbProvider.getTopRated(page);
      return {
        page: data.page,
        total_pages: data.total_pages,
        total_results: data.total_results,
        results: data.results?.map(m => tmdbProvider.normalizeMovie(m)) || [],
      };
    } catch (error) {
      return { page: 1, total_pages: 0, total_results: 0, results: [] };
    }
  }

  async getSimilar(id, options = {}) {
    const { page = 1 } = options;
    
    const tmdbProvider = factory.getProvider('TMDB');
    try {
      const data = await tmdbProvider.getSimilar(id, page);
      return {
        page: data.page,
        total_pages: data.total_pages,
        total_results: data.total_results,
        results: data.results?.map(m => tmdbProvider.normalizeMovie(m)) || [],
      };
    } catch (error) {
      return { page: 1, total_pages: 0, total_results: 0, results: [] };
    }
  }

  async getMovieById(imdbId) {
    const results = {};
    
    const omdbProvider = factory.getProvider('OMDB');
    try {
      const data = await omdbProvider.getById(imdbId);
      results['OMDB'] = omdbProvider.normalizeMovieDetail(data);
    } catch (error) {
      results['OMDB'] = { error: error.message };
    }

    return results;
  }

  getAvailableProviders() {
    return factory.getProviderNames();
  }
}

module.exports = new MovieAggregator();
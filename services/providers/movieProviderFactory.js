const TMDBProvider = require('./tmdbAdapter');
const OMDBProvider = require('./omdbAdapter');

const PROVIDERS = {
  TMDB: TMDBProvider,
  OMDB: OMDBProvider,
};

class MovieProviderFactory {
  constructor() {
    this.instances = {};
  }

  getProvider(name) {
    const providerClass = PROVIDERS[name.toUpperCase()];
    if (!providerClass) {
      throw new Error(`Provider ${name} not supported. Available: ${Object.keys(PROVIDERS).join(', ')}`);
    }

    if (!this.instances[name]) {
      this.instances[name] = new providerClass();
    }

    return this.instances[name];
  }

  getAllProviders() {
    return Object.keys(PROVIDERS);
  }

  getProviderNames() {
    return Object.keys(PROVIDERS);
  }
}

const factory = new MovieProviderFactory();

module.exports = factory;
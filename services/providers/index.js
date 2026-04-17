const factory = require('./movieProviderFactory');
const TMDBProvider = require('./tmdbAdapter');
const OMDBProvider = require('./omdbAdapter');

module.exports = {
  factory,
  TMDBProvider,
  OMDBProvider,
};
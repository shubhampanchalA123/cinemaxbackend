const movieAggregator = require('../services/movieAggregator');

const getPopularMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const providers = req.query.providers?.split(',') || ['TMDB', 'OMDB'];
    const merged = req.query.merged === 'false' ? false : true;
    const data = await movieAggregator.getPopular({ page, providers, merged });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrendingMovies = async (req, res) => {
  try {
    const data = await movieAggregator.getTrending();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const providers = req.query.providers?.split(',') || ['TMDB', 'OMDB'];
    const data = await movieAggregator.getDetails(id, { providers });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMovieVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await movieAggregator.getVideos(id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchMovies = async (req, res) => {
  try {
    const { q: query, page = 1, providers } = req.query;
    const merged = req.query.merged === 'false' ? false : true;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    const providerList = providers?.split(',') || ['TMDB', 'OMDB'];
    const data = await movieAggregator.search(query, { page: parseInt(page), providers: providerList, merged });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTopRatedMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await movieAggregator.getTopRated({ page });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSimilarMovies = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const data = await movieAggregator.getSimilar(id, { page });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMovieById = async (req, res) => {
  try {
    const { imdbId } = req.params;
    const data = await movieAggregator.getMovieById(imdbId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProviders = async (req, res) => {
  try {
    const providers = movieAggregator.getAvailableProviders();
    res.json({ providers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPopularMovies,
  getTrendingMovies,
  getMovieDetails,
  getMovieVideos,
  searchMovies,
  getTopRatedMovies,
  getSimilarMovies,
  getMovieById,
  getProviders,
};
const { fetchFromTMDB } = require('../services/tmdbService');

const getPopularMovies = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await fetchFromTMDB('/movie/popular', { page });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrendingMovies = async (req, res) => {
  try {
    const data = await fetchFromTMDB('/trending/movie/week');
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fetchFromTMDB(`/movie/${id}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMovieVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fetchFromTMDB(`/movie/${id}/videos`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchMovies = async (req, res) => {
  try {
    const { q: query, page = 1 } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    const data = await fetchFromTMDB('/search/movie', { query, page });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTopRatedMovies = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await fetchFromTMDB('/movie/top_rated', { page });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSimilarMovies = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fetchFromTMDB(`/movie/${id}/similar`);
    res.json(data);
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
};
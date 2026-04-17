const { fetchFromTMDB } = require('../services/tmdbService');

const getPopularTVShows = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await fetchFromTMDB('/tv/popular', { page });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrendingTVShows = async (req, res) => {
  try {
    const data = await fetchFromTMDB('/trending/tv/week');
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTVShowDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fetchFromTMDB(`/tv/${id}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTVShowVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fetchFromTMDB(`/tv/${id}/videos`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchTVShows = async (req, res) => {
  try {
    const { q: query, page = 1 } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    const data = await fetchFromTMDB('/search/tv', { query, page });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTopRatedTVShows = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await fetchFromTMDB('/tv/top_rated', { page });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSimilarTVShows = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fetchFromTMDB(`/tv/${id}/similar`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPopularTVShows,
  getTrendingTVShows,
  getTVShowDetails,
  getTVShowVideos,
  searchTVShows,
  getTopRatedTVShows,
  getSimilarTVShows,
};
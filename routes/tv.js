const express = require('express');
const router = express.Router();
const {
  getPopularTVShows,
  getTrendingTVShows,
  getTVShowDetails,
  getTVShowVideos,
  searchTVShows,
  getTopRatedTVShows,
  getSimilarTVShows,
} = require('../controllers/tvController');

router.get('/popular', getPopularTVShows);
router.get('/trending', getTrendingTVShows);
router.get('/top_rated', getTopRatedTVShows);
router.get('/search', searchTVShows); // /search?q=query
router.get('/:id/similar', getSimilarTVShows);
router.get('/:id/videos', getTVShowVideos);
router.get('/:id', getTVShowDetails);

module.exports = router;
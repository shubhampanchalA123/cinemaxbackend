const express = require('express');
const router = express.Router();
const {
  getPopularMovies,
  getTrendingMovies,
  getMovieDetails,
  getMovieVideos,
  searchMovies,
  getTopRatedMovies,
  getSimilarMovies,
} = require('../controllers/movieController');

router.get('/popular', getPopularMovies);
router.get('/trending', getTrendingMovies);
router.get('/top_rated', getTopRatedMovies);
router.get('/search', searchMovies); // /search?q=query
router.get('/:id/similar', getSimilarMovies);
router.get('/:id/videos', getMovieVideos);
router.get('/:id', getMovieDetails);

module.exports = router;
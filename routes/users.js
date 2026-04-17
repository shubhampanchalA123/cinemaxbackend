const express = require('express');
const router = express.Router();
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/userController');
const auth = require('../middlewares/auth');

router.use(auth); // All user routes require auth

router.get('/watchlist', getWatchlist);
router.post('/watchlist', addToWatchlist);
router.delete('/watchlist/:movieId', removeFromWatchlist);

module.exports = router;
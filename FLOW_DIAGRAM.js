/**
 * ============================================================
 *                    MOVIE API FLOW DOCUMENTATION
 * ============================================================
 * 
 * This file shows how data flows through the system when a request is made.
 * Read this file to understand the complete flow.
 * 
 * NO CODE CHANGES - Just for understanding the architecture
 * 
 * ============================================================
 */


/**
 * ============================================================
 * REQUEST: GET /api/movies/popular?page=1&merged=true
 * ============================================================
 * 
 * STEP 1: routes/movies.js (defines the route)
 * ------------------------------------------
 * router.get('/popular', getPopularMovies);
 * 
 * 
 * STEP 2: controllers/movieController.js (handles the request)
 * -----------------------------------------------------
 * const getPopularMovies = async (req, res) => {
 *   const page = parseInt(req.query.page) || 1;
 *   const providers = req.query.providers?.split(',') || ['TMDB', 'OMDB'];
 *   const merged = req.query.merged === 'false' ? false : true;
 *   const data = await movieAggregator.getPopular({ page, providers, merged });
 *   res.json(data);
 * };
 * 
 * 
 * STEP 3: services/movieAggregator.js (main logic)
 * ---------------------------------------
 * async getPopular(options = {}) {
 *   const { page = 1, providers = this.providers, merged = false } = options;
 *   const results = {};
 * 
 *   // Call each provider in parallel
 *   const providerPromises = providers.map(async (providerName) => {
 *     const provider = factory.getProvider(providerName);
 *     const data = await provider.getPopular(page);
 *     results[providerName] = { normalized movies... };
 *   });
 * 
 *   await Promise.all(providerPromises);
 * 
 *   if (merged) {
 *     return this.mergeMovies(results);  // Combine all results
 *   }
 *   return { results };
 * }
 * 
 * 
 * STEP 4: services/providers/tmdbAdapter.js (fetches from TMDB)
 * --------------------------------------------------
 * async getPopular(page = 1) {
 *   return this.fetch('/movie/popular', { page });
 * }
 * 
 * async fetch(endpoint, params = {}) {
 *   // Check cache first using Redis
 *   const cached = await getCachedData(cacheKey);
 *   if (cached) return cached;
 * 
 *   // Fetch from TMDB API
 *   const response = await this.client.get(endpoint, { params });
 *   const data = response.data;
 *   
 *   // Cache the result
 *   await setCachedData(cacheKey, data);
 *   return data;
 * }
 * 
 * 
 * STEP 5: normalizeMovie() - Convert to standard format
 * -----------------------------------------
 * normalizeMovie(movie) {
 *   return {
 *     id: movie.id?.toString(),
 *     tmdbId: movie.id?.toString(),
 *     imdbId: movie.imdb_id || null,
 *     title: movie.title,
 *     original_title: movie.original_title,
 *     overview: movie.overview,
 *     poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
 *     release_date: movie.release_date,
 *     vote_average: movie.vote_average,
 *     // ... standard fields
 *     provider: 'TMDB',
 *   };
 * }
 * 
 * 
 * STEP 6: Response sent to client
 * ------------------------
 * {
 *   "page": 1,
 *   "total_results": 1124558,
 *   "results": [
 *     { "id": "1226863", "title": "The Super Mario Galaxy Movie", "provider": "TMDB", ... },
 *     { "id": "1226864", "title": "Avatar", "provider": "OMDB", ... },
 *     ...
 *   ]
 * }
 */


/**
 * ============================================================
 * REQUEST: GET /api/movies/search?q=avatar&merged=true
 * ============================================================
 * Same flow as above, but calls search() method instead of getPopular()
 */


/**
 * ============================================================
 * REQUEST: POST /api/auth/signup
 * ============================================================
 * 
 * STEP 1: routes/auth.js
 * -----------------
 * router.post('/signup', signup);
 * 
 * 
 * STEP 2: controllers/authController.js
 * --------------------------------
 * const signup = async (req, res) => {
 *   const { email, password } = req.body;
 *   
 *   // Check if user exists
 *   const existingUser = await User.findOne({ email });
 *   if (existingUser) {
 *     return res.status(400).json({ message: 'User already exists' });
 *   }
 * 
 *   // Create new user
 *   const user = new User({ email, password, isVerified: false });
 *   await user.save();
 * 
 *   // Generate OTP
 *   const otp = generateOTP();  // utils/otpGenerator.js - returns string like "123456"
 *   user.otp = otp;
 *   user.otpExpiry = Date.now() + 10 * 60 * 1000;  // 10 minutes
 *   await user.save();
 * 
 *   // Send OTP via email
 *   await sendOTP(email, otp);  // services/emailService.js
 * 
 *   // Return response (includes OTP for dev mode)
 *   res.status(201).json({ 
 *     message: 'OTP sent to email. Please verify your account.',
 *     userId: user._id,
 *     otp: otp 
 *   });
 * };
 */


/**
 * ============================================================
 * REQUEST: POST /api/auth/verify
 * ============================================================
 * 
 * const verifyOTP = async (req, res) => {
 *   const { userId, otp } = req.body;
 *   
 *   // Find user
 *   const user = await User.findOne({ _id: userId });
 *   
 *   // Verify OTP (compare as strings)
 *   if (String(user.otp) !== String(otp) || user.otpExpiry < Date.now()) {
 *     return res.status(400).json({ message: 'Invalid or expired OTP' });
 *   }
 * 
 *   // Mark as verified
 *   user.isVerified = true;
 *   user.otp = undefined;
 *   user.otpExpiry = undefined;
 *   await user.save();
 * 
 *   // Generate JWT token
 *   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
 * 
 *   res.json({ 
 *     message: 'Account verified successfully!',
 *     token, 
 *     user: { id: user._id, email: user.email, isVerified: true } 
 *   });
 * };
 */


/**
 * ============================================================
 * REQUEST: POST /api/auth/login
 * ============================================================
 * 
 * const login = async (req, res) => {
 *   const { email, password } = req.body;
 *   
 *   // Find user
 *   const user = await User.findOne({ email });
 *   
 *   // Check password
 *   if (!user || !(await user.comparePassword(password))) {
 *     return res.status(401).json({ message: 'Invalid credentials' });
 *   }
 * 
 *   // Check if verified
 *   if (!user.isVerified) {
 *     return res.status(401).json({ 
 *       message: 'Account not verified. Please verify your account first.',
 *       userId: user._id
 *     });
 *   }
 * 
 *   // Generate token
 *   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
 * 
 *   res.json({ token, user: { id: user._id, email: user.email } });
 * };
 */


/**
 * ============================================================
 * PROTECTED REQUEST: GET /api/users/watchlist
 * ============================================================
 * 
 * STEP 1: routes/users.js
 * -----------------
 * router.use(auth);  // Apply auth middleware to ALL routes in this file
 * router.get('/watchlist', getWatchlist);
 * 
 * STEP 2: middlewares/auth.js
 * ------------------------
 * const auth = async (req, res, next) => {
 *   // Get token from header
 *   const token = req.header('Authorization')?.replace('Bearer ', '');
 *   
 *   // Verify token
 *   const decoded = jwt.verify(token, process.env.JWT_SECRET);
 *   
 *   // Find user
 *   const user = await User.findById(decoded.id);
 *   
 *   // Add user to request
 *   req.user = user;
 *   next();
 * };
 * 
 * STEP 3: controllers/userController.js
 * --------------------------------
 * const getWatchlist = async (req, res) => {
 *   const user = await User.findById(req.user._id).select('watchlist');
 *   res.json(user.watchlist);  // Returns array of movie IDs
 * };
 */


/**
 * ============================================================
 * ADD TO WATCHLIST: POST /api/users/watchlist
 * ============================================================
 * 
 * const addToWatchlist = async (req, res) => {
 *   const { movieId } = req.body;
 *   
 *   const user = await User.findById(req.user._id);
 *   
 *   // Check if already exists
 *   if (user.watchlist.includes(movieId)) {
 *     return res.status(400).json({ message: 'Movie already in watchlist' });
 *   }
 * 
 *   user.watchlist.push(movieId);
 *   await user.save();
 *   
 *   res.json({ message: 'Added to watchlist', watchlist: user.watchlist });
 * };
 */


/**
 * ============================================================
 * COMPLETE FILE STRUCTURE
 * ============================================================
 * 
 * app.js                    - Main Express app
 * 
 * routes/
 *   ├── auth.js            - /api/auth/* endpoints
 *   ├── movies.js          - /api/movies/* endpoints  
 *   ├── tv.js             - /api/tv/* endpoints
 *   └── users.js          - /api/users/* endpoints (protected)
 * 
 * controllers/
 *   ├── authController.js   - Handle auth requests
 *   ├── movieController.js - Handle movie requests
 *   └── userController.js  - Handle user requests
 * 
 * services/
 *   ├── movieAggregator.js  - Combine data from providers
 *   ├── emailService.js  - Send emails
 *   └── providers/
 *       ├── baseProvider.js        - Abstract interface
 *       ├── tmdbAdapter.js        - TMDB API
 *       ├── omdbAdapter.js       - OMDB API
 *       └── movieProviderFactory.js - Create providers
 * 
 * middlewares/
 *   ├── auth.js            - JWT verification
 *   ├── errorHandler.js  - Error handling
 *   └── rateLimiter.js  - Rate limiting
 * 
 * models/
 *   └── User.js           - User schema
 * 
 * config/
 *   ├── database.js      - MongoDB connection
 *   └── redis.js        - Redis connection
 * 
 * utils/
 *   └── otpGenerator.js - Generate OTP
 */


/**
 * ============================================================
 * ENVIRONMENT VARIABLES (.env)
 * ============================================================
 * 
 * TMDB_API_KEY=f6cb9a437261d5ea620cff46f0faff2f
 * OMDB_API_KEY=9ef2d729
 * JWT_SECRET=your_jwt_secret
 * MONGO_URI=mongodb://localhost:27017/movieapp
 * REDIS_URL=redis://localhost:6379
 * SMTP_EMAIL=your_email@gmail.com
 * SMTP_PASSWORD=your_password
 */


module.exports = 'Read this file to understand the flow!';
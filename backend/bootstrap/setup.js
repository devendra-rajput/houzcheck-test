/**
 * Application Setup
 * Configures and bootstraps the Express application
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const setupRoutes = require('./routes');
const i18n = require('../config/i18n');
const { corsConfig, validateCorsConfig } = require('../config/cors');
const { connectDB } = require('../config/v1/mysql');
const { connectRedis } = require('../config/v1/redis');

const { initialize: initializeModels } = require('./modelManager');
const rateLimiterMiddleware = require('../middleware/rateLimiter');
const timezoneMiddleware = require('../middleware/timezone');
const errorMiddleware = require('../middleware/error');

const { logger } = require('../utils/logger');
const { validateEnvironment: validateEnv } = require('../utils/envValidator');

/**
 * Validate environment variables
 */
const setupEnvironmentValidation = () => {
  console.log('📋 Validating environment variables...');
  validateEnv();
  console.log('✅ Environment validation passed');
};

/**
 * Connect to databases and initialize models
 */
const setupDatabases = async () => {
  console.log('🔌 Connecting to MySQL...');
  await connectDB();
  console.log('✅ MySQL connected');

  console.log('🔧 Initializing database models...');
  await initializeModels();
  console.log('✅ Models initialized');

  console.log('🔌 Connecting to Redis...');
  await connectRedis();
  console.log('✅ Redis connected\n');
};

/**
 * Setup body parsers
 */
const setupBodyParsers = (app) => {
  console.log('📦 Setting up body parsers...');
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json({ limit: '50mb' }));
};

/**
 * Setup CORS configuration
 */
const setupCORS = (app) => {
  console.log('🌐 Setting up CORS...');
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow server-to-server or curl
        if (!origin) return callback(null, true);

        if (corsConfig.allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        logger.error('Blocked by CORS', { origin });
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: corsConfig.credentials,
      methods: corsConfig.methods,
      allowedHeaders: corsConfig.allowedHeaders,
      exposedHeaders: corsConfig.exposedHeaders,
      maxAge: corsConfig.maxAge,
    }),
  );

  /**
     * Validate CORS configuration
     */
  validateCorsConfig();
};

/**
 * Setup security headers
 */
const setupSecurity = (app) => {
  console.log('🔒 Setting up security headers...');
  app.use(helmet());
  app.set('trust proxy', 'loopback');
};

/**
 * Setup internationalization
 */
const setupI18n = (app) => {
  console.log('🌍 Setting up i18n...');
  app.use(i18n.init);
};

/**
 * Setup application middleware
 */
const setupMiddleware = (app) => {
  console.log('⚙️  Setting up middleware...');
  app.use(timezoneMiddleware);
  app.use(rateLimiterMiddleware);
};

/**
 * Setup request logging
 */
const setupRequestLogging = (app) => {
  if (process.env.LOG_DISABLE === 'false') {
    console.log('📝 Setting up request logging...');
    app.use((req, res, next) => {
      console.log('Incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        timezone: req.timezone,
        userAgent: req.get('User-Agent'),
      });
      next();
    });
  }
};

/**
 * Setup static file serving
 */
const setupStaticFiles = (app) => {
  console.log('📁 Setting up static file serving...');
  app.use('/public', express.static('public'));
  app.use('/uploads', express.static('uploads'));
};

/**
 * Setup application routes
 */
const setupApplicationRoutes = async (app) => {
  console.log('🛣️  Setting up routes...');
  await setupRoutes(app);
  console.log('✅ Routes configured');
};

/**
 * Setup error handling middleware
 */
const setupErrorHandling = (app) => {
  console.log('❌ Setting up error handling...');
  app.use(errorMiddleware);
};

/**
 * Main application setup function
 */
const setupApplication = async (app) => {
  console.log('🚀 Starting application bootstrap...\n');

  try {
    // Step 1: Validate environment
    setupEnvironmentValidation();

    // Step 2: Connect to databases
    await setupDatabases();

    // Step 3: Setup body parsers
    setupBodyParsers(app);

    // Step 4: Setup CORS
    setupCORS(app);

    // Step 5: Setup security
    setupSecurity(app);

    // Step 6: Setup i18n
    setupI18n(app);

    // Step 7: Setup middleware
    setupMiddleware(app);

    // Step 8: Setup request logging
    setupRequestLogging(app);

    // Step 9: Setup static files
    setupStaticFiles(app);

    // Step 10: Setup routes
    await setupApplicationRoutes(app);

    // Step 11: Setup error handling (must be last)
    setupErrorHandling(app);

    console.log('\n✅ Application bootstrap completed successfully!\n');
  } catch (error) {
    console.log('\n❌ Application bootstrap failed:');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
    process.exit(1);
  }
};

module.exports = {
  setupApplication,
};

const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { setupApplication } = require('./setup');
const { cleanup: cleanupRedis } = require('../services/redis');
const { initSocket } = require('../services/socket');

const createHttpServer = (app) => {
  if (process.env.SSL_STATUS === 'true') {
    console.log('🔒 Creating HTTPS server...');
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const key = fs.readFileSync(process.env.SSL_KEY_PEM_PATH, 'utf8');
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const cert = fs.readFileSync(process.env.SSL_CERT_PEM_PATH, 'utf8');
    const options = { key, cert };
    console.log('✅ HTTPS server created');
    return https.createServer(options, app);
  }

  console.log('🌐 Creating HTTP server...');
  const server = http.Server(app);
  console.log('✅ HTTP server created');
  return server;
};

const startListening = (server) => new Promise((resolve) => {
  const port = process.env.APPLICATION_PORT || 8000;
  const protocol = process.env.SSL_STATUS === 'true' ? 'https' : 'http';

  server.listen(port, '0.0.0.0', () => {
    console.log(`\n🚀 Server listening on port: ${port}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 URL: ${protocol}://localhost:${port}\n`);
    resolve(server);
  });
});

const cleanupServices = async () => {
  console.log('🧹 Cleaning up services...');

  // Run all cleanup functions in parallel
  await Promise.allSettled([
    cleanupRedis().catch((err) => console.log('Redis cleanup error:', err)),
  ]);

  console.log('✅ All services cleaned up');
};

const gracefulShutdown = async (server, signal) => {
  console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...\n`);

  try {
    // Close server
    if (server) {
      console.log('🔌 Closing HTTP/HTTPS server...');
      await new Promise((resolve) => {
        server.close(resolve);
      });
      console.log('✅ Server closed');
    }

    // Cleanup all services
    await cleanupServices();

    console.log('👋 Graceful shutdown completed\n');
    process.exit(0);
  } catch (error) {
    console.log('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

const createServer = async () => {
  console.log('🎬 Starting server initialization...\n');

  // Step 1: Create Express app
  const app = express();

  // Step 2: Setup application (middleware, routes, etc.)
  await setupApplication(app);

  // Step 3: Create HTTP/HTTPS server
  const server = createHttpServer(app);

  // Step 4: Start listening
  await startListening(server);

  // Step 5: Initialize socket
  await initSocket(server);

  console.log('✅ Server started successfully!\n');

  return server;
};

module.exports = {
  createServer,
  gracefulShutdown,
};

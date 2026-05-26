/**
 * User Routes
 * Defines all user-related API endpoints
 */

const express = require('express');
const userController = require('../resources/v1/users/users.controller');
const userValidation = require('../resources/v1/users/users.validation');
const { auth } = require('../middleware/v1/authorize');

// Authentication routes (public)
const createAuthRoutes = (router) => {
  router.get(
    '/',
    userController.getAllWithPagination,
  );

  router.post(
    '/create',
    [
      userValidation.createOne,
    ],
    userController.createOne,
  );

  router.post(
    '/login',
    [userValidation.userLogin],
    userController.userLogin,
  );

  return router;
};

// Protected user routes
const createProtectedUserRoutes = (router) => {
  router.get(
    '/profile',
    [auth()],
    userController.getUserProfile,
  );

  router.get(
    '/logout',
    [auth()],
    userController.logout,
  );

  return router;
};

/**
 * Initialize all user routes
 */
const initializeUserRoutes = () => {
  const router = express.Router();

  createAuthRoutes(router);
  createProtectedUserRoutes(router);

  return router;
};

/**
 * Export configured router
 */
module.exports = initializeUserRoutes();

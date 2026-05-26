/**
 * User Controller
 * Handles HTTP requests for user operations
 */

const response = require('../../../helpers/v1/response.helpers');
const dataHelper = require('../../../helpers/v1/data.helpers');
const UserModel = require('./user.model');
const OrganizationModel = require('../organizations/organization.model');
// const { emitToAll } = require('../../../services/socket');
// const socketEvents = require('../../../constants/socket_events');

/**
 * Create a new user
 */
const createOne = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      organization_name,
    } = req.body;

    // Check if user exists
    const isUserExist = await UserModel.isUserExist('email', email);
    if (isUserExist) {
      return response.conflict('error.emailExist', res, false);
    }

    // Hash password
    const hashedPassword = await dataHelper.hashPassword(password);

    // Create organization if not exist
    const organizationObj = await OrganizationModel.getOneByColumnNameAndValue('name', organization_name);
    let organizationId;
    if (!organizationObj) {
      const organization = await OrganizationModel.createOne({ name: organization_name });
      organizationId = organization.id;
    } else {
      organizationId = organizationObj.id;
    }

    // Prepare user data
    const userData = {
      email,
      password: hashedPassword,
      first_name,
      last_name,
      organization_id: organizationId,
    };

    // Create user
    const hasCreated = await UserModel.createOne(userData);
    if (!hasCreated) {
      return response.exception('error.serverError', res, false);
    }

    // emitToAll(socketEvents.EMIT.NEW_USER, { email, first_name, last_name });
    return response.created('success.userCreated', res, true);
  } catch (error) {
    console.error('UserController@createOne Error:', error.message);
    return response.exception('error.serverError', res, false);
  }
};

/**
 * User Login
 */
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await UserModel.getOneByColumnNameAndValue('email', email, true);
    if (!user) {
      return response.badRequest('auth.invalidCredentails', res, false);
    }

    // Validate password
    const isValidPassword = await dataHelper.validatePassword(password, user.password);
    if (!isValidPassword) {
      return response.badRequest('auth.invalidCredentails', res, false);
    }

    // Generate JWT token
    const tokenData = {
      user_id: user.id,
      role: user.role,
    };
    const token = await dataHelper.generateJWTToken(tokenData);

    const userData = {
      auth_token: token,
      fcm_token: req.headers['fcm-token'],
    };

    const hasUpdated = await UserModel.updateOne(user.id, userData);
    if (!hasUpdated) {
      return response.exception('error.serverError', res, null);
    }

    const updatedUser = await UserModel.getOneByColumnNameAndValue('id', user.id);
    const formattedUserData = UserModel.getFormattedData(updatedUser);

    const result = {
      token,
      user: formattedUserData,
    };

    return response.success('auth.loggedIn', res, result);
  } catch (error) {
    console.error('UserController@userLogin Error:', error.message);
    return response.exception('error.serverError', res, false);
  }
};

/**
 * Get user profile
 */
const getUserProfile = async (req, res) => {
  try {
    const { user } = req;

    const formattedUserData = UserModel.getFormattedData(user);

    return response.success('success.userProfile', res, formattedUserData);
  } catch (error) {
    console.error('UserController@getUserProfile Error:', error.message);
    return response.exception('error.serverError', res, false);
  }
};

/**
 * Get all users with pagination
 */
const getAllWithPagination = async (req, res) => {
  try {
    // Extract page, limit, and search
    const { page, limit } = dataHelper.getPageAndLimit(req.query);
    const { search } = req.query;

    const filterObj = {
      role: UserModel.USER_ROLES.USER,
      search: search || null,
    };

    const result = await UserModel.getAllWithPagination(page, limit, filterObj);

    if (!result?.data?.length) {
      return response.success('success.noRecordsFound', res, result);
    }

    return response.success('success.usersData', res, result);
  } catch (error) {
    console.error('UserController@getAllWithPagination Error:', error.message);
    return response.exception('error.serverError', res, false);
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    const { user } = req;

    const dataToUpdate = {
      auth_token: '',
      fcm_token: '',
    };

    const hasUpdated = await UserModel.updateOne(user.id, dataToUpdate);
    if (!hasUpdated) {
      return response.exception('error.serverError', res, null);
    }

    return response.success('auth.logoutSuccess', res, true);
  } catch (error) {
    console.error('UserController@logout Error:', error.message);
    return response.exception('error.serverError', res, false);
  }
};

module.exports = {
  createOne,
  userLogin,
  getUserProfile,
  getAllWithPagination,
  logout,
};

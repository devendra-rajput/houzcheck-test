/**
 * User Validation Middleware
 * Validates user-related requests using Joi schemas
 */

const Joi = require('joi');

const response = require('../../../helpers/v1/response.helpers');
const dataHelper = require('../../../helpers/v1/data.helpers');

/**
 * Reusable Joi Schema Components
 */
const SCHEMAS = Object.freeze({
  email: Joi.string().email().required(),
  emailOptional: Joi.string().email().optional(),
  password: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().optional(),
  organizationName: Joi.string().required(),
});

/**
 * Validation Schemas
 */
const validationSchemas = Object.freeze({
  createOne: {
    first_name: SCHEMAS.firstName,
    last_name: SCHEMAS.lastName,
    email: SCHEMAS.email,
    password: SCHEMAS.password,
    confirm_password: SCHEMAS.password,
    organization_name: SCHEMAS.organizationName,
  },
  userLogin: {
    email: SCHEMAS.email,
    password: SCHEMAS.password,
  },
});

/**
 * Pure Validation Functions
 */

/**
 * Validate password strength
 */
const validatePasswordStrength = (password) => dataHelper.checkPasswordRegex(password);

/**
 * Validate password match
 */
const validatePasswordMatch = (password, confirmPassword) => password === confirmPassword;

/**
 * Higher-Order Validation Factory
 */

/**
 * Create validation middleware
 * Factory function that creates validation middleware
 */
const createValidator = (schema, customValidation = null) => async (req, res, next) => {
  // Joi schema validation
  const errors = await dataHelper.joiValidation(req.body, schema);
  if (errors?.length) {
    return response.validationError(errors[0], res, errors);
  }

  // Custom validation
  if (customValidation) {
    const customError = await customValidation(req, res);
    if (customError) {
      return customError;
    }
  }

  next();
};

/**
 * Validate create user request
 */
const validateCreateUser = async (req, res) => {
  const { password, confirm_password } = req.body;

  // Check password strength
  const isStrongPassword = await validatePasswordStrength(password);
  if (!isStrongPassword) {
    return response.validationError('validation.strongPassword', res, false);
  }

  // Check password match
  if (!validatePasswordMatch(password, confirm_password)) {
    return response.validationError('validation.confirmPasswordNotMatch', res, false);
  }

  return null;
};

/**
 * Validation Middleware Exports
 */

const createOne = createValidator(validationSchemas.createOne, validateCreateUser);
const userLogin = createValidator(validationSchemas.userLogin);
/**
 * Export all validation middleware
 */
module.exports = {
  createOne,
  userLogin,
};

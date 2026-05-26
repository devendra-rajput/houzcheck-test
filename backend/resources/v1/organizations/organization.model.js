/**
 * Organization Model - Data Access Layer
 */

const { Op } = require('sequelize');
const { Organization } = require('../../../models');

// Lazy load dependencies only when needed
// eslint-disable-next-line global-require
const getDataHelper = () => require('../../../helpers/v1/data.helpers');
// eslint-disable-next-line global-require
const getRedisService = () => require('../../../services/redis');

/**
 * Cache key prefixes
 */
const CACHE_KEYS = Object.freeze({
  organizationsList: 'organizations:list:',
});

/**
 * Common query conditions
 */
const COMMON_QUERIES = Object.freeze({
  notDeleted: {
    deleted_at: null,
  },
});

const createNotDeletedQuery = (additionalQuery = {}) => ({
  ...COMMON_QUERIES.notDeleted,
  ...additionalQuery,
});

const invalidateOrganizationListCache = async () => {
  const redis = getRedisService();
  const keys = await redis.getAllSpecificKeys(CACHE_KEYS.organizationsList);

  if (keys && keys.length > 0) {
    await Promise.all(keys.map((key) => redis.clearKey(key)));
  }
};

// Create a new organization
const createOne = async (data) => {
  try {
    if (!data) {
      throw new Error('Data is required');
    }

    const organization = await Organization.create(data);
    if (!organization) {
      return false;
    }

    // Invalidate cache asynchronously (fire and forget)
    invalidateOrganizationListCache().catch(() => { });

    return organization;
  } catch (error) {
    console.error('OrganizationModel@createOne Error:', error.message);
    return false;
  }
};

// Get organization by column name and value
const getOneByColumnNameAndValue = async (
  columnName,
  columnValue,
  includeSensitive = false,
) => {
  try {
    const redis = getRedisService();
    const dataHelper = getDataHelper();

    // Generate cache key
    const cacheKey = dataHelper.generateCacheKey(CACHE_KEYS.organizationsList, {
      columnName,
      columnValue,
    });

    // Try to get from cache
    const cachedData = await redis.getKey(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const query = {
      where: createNotDeletedQuery({
        [columnName]: columnValue,
      }),
      raw: true,
    };

    // Exclude sensitive fields unless explicitly requested
    if (!includeSensitive) {
      query.attributes = COMMON_QUERIES.excludeSensitiveFields;
    }

    const result = await Organization.findOne(query);

    if (!result) {
      return false;
    }

    return result;
  } catch (error) {
    console.error('OrganizationModel@getOneByColumnNameAndValue Error:', error.message);
    return false;
  }
};

// Check if organization exists
const isOrganizationExist = async (columnName, columnValue, organizationId = false) => {
  try {
    let query = createNotDeletedQuery({
      [columnName]: columnValue,
    });

    if (organizationId) {
      query = {
        ...query,
        id: {
          [Op.ne]: organizationId,
        },
      };
    }

    const organizationsCount = await Organization.count({
      where: query,
    });

    return organizationsCount > 0;
  } catch (error) {
    console.error('OrganizationModel@isOrganizationExist Error:', error.message);
    return false;
  }
};

// Update organization
const updateOne = async (id, data) => {
  try {
    if (!id || !data) {
      throw new Error('ID and data are required');
    }

    const hasUpdated = await Organization.update(data, {
      where: { id },
    });

    if (!hasUpdated) {
      return false;
    }

    const updatedOrganization = await Organization.findOne({
      where: { id },
      raw: true,
    });

    // Invalidate cache asynchronously (fire and forget)
    invalidateOrganizationListCache().catch(() => { });

    return updatedOrganization;
  } catch (error) {
    console.error('OrganizationModel@updateOne Error:', error.message);
    return false;
  }
};

// Delete organization
const deleteOne = async (id) => {
  try {
    const hasDeleted = await Organization.destroy({
      where: { id },
    });

    if (!hasDeleted) {
      return false;
    }

    // Invalidate cache asynchronously (fire and forget)
    invalidateOrganizationListCache().catch(() => { });

    return true;
  } catch (error) {
    console.error('OrganizationModel@deleteOne Error:', error.message);
    return false;
  }
};

// Format organization data for response
const getFormattedData = (organizationObj) => {
  if (!organizationObj) {
    throw new Error('organizationObj is required');
  }

  const dataHelper = getDataHelper();

  return {
    id: organizationObj.id,
    first_name: organizationObj.name,
    created_at: dataHelper.convertDateTimezoneAndFormat(organizationObj.created_at),
    updated_at: dataHelper.convertDateTimezoneAndFormat(organizationObj.updated_at),
    deleted_at: organizationObj.deleted_at,
  };
};

module.exports = {
  createOne,
  getOneByColumnNameAndValue,
  getFormattedData,
  updateOne,
  deleteOne,
  isOrganizationExist,
};

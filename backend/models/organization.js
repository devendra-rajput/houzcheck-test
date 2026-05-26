/**
 * Organization Model Definition
 */

const OrganizationSchema = (sequelize, DataTypes) => {
  const Organization = sequelize.define(
    'Organization',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'organizations',
      underscored: true, // Automatically handles snake_case for timestamps
      timestamps: true,
      paranoid: true, // Enables the 'deleted_at' soft-delete functionality
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    },
  );

  /**
   * Define Associations
   */
  // Organization.associate = (models) => {
  //   // Example: Organization.hasMany(models.User, { foreignKey: 'organization_id' });
  // };

  return Organization;
};

module.exports = OrganizationSchema;

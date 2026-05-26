/**
 * User Model Definition
 */

const UserSchema = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      organization_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      auth_token: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: DataTypes.ENUM('0', '1', '2', '3'), // 0=>Inactive, 1=>Active, 2=>Blocked, 3=>Deleted
        allowNull: false,
        defaultValue: '1',
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
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
      tableName: 'users',
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
  User.associate = (models) => {
    User.belongsTo(models.Organization, { foreignKey: 'organization_id', as: 'organization' });
  };

  return User;
};

module.exports = UserSchema;

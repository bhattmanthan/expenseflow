module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
      field: 'password_hash',
    },
    role: {
      type: DataTypes.ENUM('employee', 'manager', 'finance_admin'),
      defaultValue: 'employee',
    },
    department: DataTypes.STRING,
    notes: DataTypes.TEXT,
    avatarUrl: {
      type: DataTypes.STRING,
      field: 'avatar_url',
    },
    managerId: {
      type: DataTypes.UUID,
      field: 'manager_id',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
  }, {
    tableName: 'users',
    underscored: true,
  });

  User.associate = (models) => {
    User.hasMany(models.Expense, { foreignKey: 'userId', as: 'expenses' });
    User.belongsTo(models.User, { as: 'manager', foreignKey: 'managerId' });
    User.hasMany(models.User, { as: 'directReports', foreignKey: 'managerId' });
  };

  return User;
};

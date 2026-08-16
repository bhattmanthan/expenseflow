module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define('Expense', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
    },
    amount: DataTypes.DECIMAL(10, 2),
    category: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    description: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
  }, {
    tableName: 'expenses',
    underscored: true,
  });

  Expense.associate = (models) => {
    Expense.belongsTo(models.User, { foreignKey: 'userId', as: 'employee' });
    Expense.hasMany(models.Attachment, { foreignKey: 'expenseId', as: 'attachments' });
    Expense.hasMany(models.Comment, { foreignKey: 'expenseId', as: 'comments' });
    Expense.hasMany(models.ApprovalLog, { foreignKey: 'expenseId', as: 'approvalLogs' });
  };

  return Expense;
};

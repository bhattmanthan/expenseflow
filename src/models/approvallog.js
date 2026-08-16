module.exports = (sequelize, DataTypes) => {
  const ApprovalLog = sequelize.define('ApprovalLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    expenseId: {
      type: DataTypes.UUID,
      field: 'expense_id',
    },
    actorId: {
      type: DataTypes.UUID,
      field: 'actor_id',
    },
    previousStatus: {
      type: DataTypes.STRING,
      field: 'previous_status',
    },
    newStatus: {
      type: DataTypes.STRING,
      field: 'new_status',
    },
    comment: DataTypes.TEXT,
  }, {
    tableName: 'approval_logs',
    underscored: true,
  });

  ApprovalLog.associate = (models) => {
    ApprovalLog.belongsTo(models.Expense, { foreignKey: 'expenseId' });
    ApprovalLog.belongsTo(models.User, { foreignKey: 'actorId', as: 'actor' });
  };

  return ApprovalLog;
};

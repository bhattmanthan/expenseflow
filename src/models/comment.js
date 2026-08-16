module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    expenseId: {
      type: DataTypes.UUID,
      field: 'expense_id',
    },
    authorId: {
      type: DataTypes.UUID,
      field: 'author_id',
    },
    body: DataTypes.TEXT,
  }, {
    tableName: 'comments',
    underscored: true,
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.Expense, { foreignKey: 'expenseId' });
    Comment.belongsTo(models.User, { foreignKey: 'authorId', as: 'author' });
  };

  return Comment;
};

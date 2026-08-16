module.exports = (sequelize, DataTypes) => {
  const Attachment = sequelize.define('Attachment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    expenseId: {
      type: DataTypes.UUID,
      field: 'expense_id',
    },
    originalFilename: {
      type: DataTypes.STRING,
      field: 'original_filename',
    },
    storedFilename: {
      type: DataTypes.STRING,
      field: 'stored_filename',
    },
    mimeType: {
      type: DataTypes.STRING,
      field: 'mime_type',
    },
  }, {
    tableName: 'attachments',
    underscored: true,
  });

  Attachment.associate = (models) => {
    Attachment.belongsTo(models.Expense, { foreignKey: 'expenseId' });
  };

  return Attachment;
};

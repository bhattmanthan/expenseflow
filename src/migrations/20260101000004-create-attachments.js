module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('attachments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      expense_id: {
        type: Sequelize.UUID,
        references: { model: 'expenses', key: 'id' },
      },
      original_filename: Sequelize.STRING,
      stored_filename: Sequelize.STRING,
      mime_type: Sequelize.STRING,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('attachments');
  },
};

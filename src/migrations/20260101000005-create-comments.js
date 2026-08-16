module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('comments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      expense_id: {
        type: Sequelize.UUID,
        references: { model: 'expenses', key: 'id' },
      },
      author_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
      },
      body: Sequelize.TEXT,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('comments');
  },
};

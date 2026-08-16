module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('approval_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      expense_id: {
        type: Sequelize.UUID,
        references: { model: 'expenses', key: 'id' },
      },
      actor_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
      },
      previous_status: Sequelize.STRING,
      new_status: Sequelize.STRING,
      comment: Sequelize.TEXT,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('approval_logs');
  },
};

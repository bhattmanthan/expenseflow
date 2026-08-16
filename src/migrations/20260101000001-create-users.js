module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: Sequelize.STRING,
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      password_hash: Sequelize.STRING,
      role: {
        type: Sequelize.ENUM('employee', 'manager', 'finance_admin'),
        defaultValue: 'employee',
      },
      department: Sequelize.STRING,
      notes: Sequelize.TEXT,
      avatar_url: Sequelize.STRING,
      manager_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('password_reset_token', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      usuario_id: { type: Sequelize.INTEGER, allowNull: false },
      token: { type: Sequelize.STRING, allowNull: false, unique: true },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      used: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      criado_em: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addConstraint('password_reset_token', {
      fields: ['usuario_id'],
      type: 'foreign key',
      name: 'password_reset_token_usuario_fk',
      references: { table: 'usuario', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('password_reset_token');
  },
};



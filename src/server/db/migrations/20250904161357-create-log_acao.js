'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('log_acao', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      usuario_id: { type: Sequelize.INTEGER, allowNull: true },
      acao: { type: Sequelize.STRING, allowNull: true },
      entidade_afetada: { type: Sequelize.STRING, allowNull: true },
      id_entidade: { type: Sequelize.INTEGER, allowNull: true },
      timestamp: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addConstraint('log_acao', {
      fields: ['usuario_id'],
      type: 'foreign key',
      name: 'log_acao_usuario_fk',
      references: { table: 'usuario', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'SET NULL',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('log_acao');
  },
};

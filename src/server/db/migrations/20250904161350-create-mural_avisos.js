'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mural_avisos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      remetente_id: { type: Sequelize.INTEGER, allowNull: true },
      conteudo: { type: Sequelize.TEXT, allowNull: true },
      data_publicacao: { type: Sequelize.DATE, allowNull: true },
      setor_destino: { type: Sequelize.STRING, allowNull: true },
      visivel_ate: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addConstraint('mural_avisos', {
      fields: ['remetente_id'],
      type: 'foreign key',
      name: 'mural_avisos_usuario_fk',
      references: { table: 'usuario', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'SET NULL',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mural_avisos');
  },
};

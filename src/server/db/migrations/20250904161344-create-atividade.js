'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('atividade', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      nome: { type: Sequelize.STRING, allowNull: true },
      tipo: { type: Sequelize.STRING, allowNull: true },
      duracao_padrao: { type: Sequelize.INTEGER, allowNull: true },
      cor: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.BOOLEAN, allowNull: true },
      criado_em: { type: Sequelize.DATE, allowNull: true },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('atividade');
  },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('aluno', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      nome: { type: Sequelize.STRING, allowNull: true },
      idade: { type: Sequelize.INTEGER, allowNull: true },
      turma: { type: Sequelize.STRING, allowNull: true },
      turno: { type: Sequelize.STRING, allowNull: true },
      escola_regular: { type: Sequelize.STRING, allowNull: true },
      serie: { type: Sequelize.STRING, allowNull: true },
      cidade: { type: Sequelize.STRING, allowNull: true },
      responsavel_nome: { type: Sequelize.STRING, allowNull: true },
      responsavel_telefone: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.BOOLEAN, allowNull: true },
      observacoes: { type: Sequelize.TEXT, allowNull: true },
      criado_em: { type: Sequelize.DATE, allowNull: true },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('aluno');
  },
};

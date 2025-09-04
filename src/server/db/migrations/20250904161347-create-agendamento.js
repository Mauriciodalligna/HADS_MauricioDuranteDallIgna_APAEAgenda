'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('agendamento', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      aluno_id: { type: Sequelize.INTEGER, allowNull: true },
      profissional_id: { type: Sequelize.INTEGER, allowNull: true },
      atividade_id: { type: Sequelize.INTEGER, allowNull: true },
      data: { type: Sequelize.DATEONLY, allowNull: true },
      hora_inicio: { type: Sequelize.TIME, allowNull: true },
      hora_fim: { type: Sequelize.TIME, allowNull: true },
      status: { type: Sequelize.STRING, allowNull: true },
      motivo_cancelamento: { type: Sequelize.TEXT, allowNull: true },
      criado_em: { type: Sequelize.DATE, allowNull: true },
    });

    // FKs conforme BancoDados.sql
    await queryInterface.addConstraint('agendamento', {
      fields: ['aluno_id'],
      type: 'foreign key',
      name: 'agendamento_aluno_fk',
      references: { table: 'aluno', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'SET NULL',
    });
    await queryInterface.addConstraint('agendamento', {
      fields: ['profissional_id'],
      type: 'foreign key',
      name: 'agendamento_profissional_fk',
      references: { table: 'profissional', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'SET NULL',
    });
    await queryInterface.addConstraint('agendamento', {
      fields: ['atividade_id'],
      type: 'foreign key',
      name: 'agendamento_atividade_fk',
      references: { table: 'atividade', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'SET NULL',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('agendamento');
  },
};

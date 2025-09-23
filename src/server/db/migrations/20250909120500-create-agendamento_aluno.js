'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('agendamento_aluno', {
      agendamento_id: { type: Sequelize.INTEGER, allowNull: false },
      aluno_id: { type: Sequelize.INTEGER, allowNull: false },
    });

    await queryInterface.addConstraint('agendamento_aluno', {
      fields: ['agendamento_id', 'aluno_id'],
      type: 'primary key',
      name: 'agendamento_aluno_pk'
    });

    await queryInterface.addConstraint('agendamento_aluno', {
      fields: ['agendamento_id'],
      type: 'foreign key',
      name: 'agendamento_aluno_agendamento_fk',
      references: { table: 'agendamento', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('agendamento_aluno', {
      fields: ['aluno_id'],
      type: 'foreign key',
      name: 'agendamento_aluno_aluno_fk',
      references: { table: 'aluno', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'RESTRICT',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('agendamento_aluno');
  }
};



'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('aluno', {
      fields: ['nome', 'turma'],
      type: 'unique',
      name: 'aluno_unique_nome_turma'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('aluno', 'aluno_unique_nome_turma');
  },
};



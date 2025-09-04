'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('atividade', [
      {
        nome: 'Fonoaudiologia',
        tipo: 'Terapia',
        duracao_padrao: 50,
        cor: '#4CAF50',
        status: true,
        criado_em: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('atividade', { nome: 'Fonoaudiologia' });
  }
};

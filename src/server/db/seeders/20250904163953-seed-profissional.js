'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('profissional', [
      {
        nome: 'Ana Souza',
        setor: 'Saúde',
        especialidade: 'Fonoaudióloga',
        status: true,
        criado_em: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('profissional', { nome: 'Ana Souza' });
  }
};

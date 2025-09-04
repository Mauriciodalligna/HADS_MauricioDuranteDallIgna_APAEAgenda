'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('usuario', [
      {
        nome: 'Gestor Admin',
        email: 'gestor@apae.com',
        senha: '123456', // placeholder
        perfil: 'gestor',
        status: true,
        criado_em: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuario', { email: 'gestor@apae.local' });
  }
};

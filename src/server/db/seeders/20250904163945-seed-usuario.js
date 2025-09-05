'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const senhaHash = await bcrypt.hash('admin123', 10);
    await queryInterface.bulkInsert('usuario', [
      {
        nome: 'Gestor Admin',
        email: 'gestor@apae.com',
        senha: senhaHash,
        perfil: 'gestor',
        status: true,
        must_change_password: true,
        criado_em: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuario', { email: 'gestor@apae.com' });
  }
};

'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const senhaHash = await bcrypt.hash('admin123', 10);
    await queryInterface.sequelize.query(
      'UPDATE usuario SET senha = :senha, must_change_password = true, status = true WHERE email = :email',
      { replacements: { senha: senhaHash, email: 'gestor@apae.com' } }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'UPDATE usuario SET must_change_password = false WHERE email = :email',
      { replacements: { email: 'gestor@apae.com' } }
    );
  }
};



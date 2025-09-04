'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('disponibilidade', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      profissional_id: { type: Sequelize.INTEGER, allowNull: true },
      dia_semana: { type: Sequelize.STRING, allowNull: true },
      hora_inicio: { type: Sequelize.TIME, allowNull: true },
      hora_fim: { type: Sequelize.TIME, allowNull: true },
    });

    await queryInterface.addConstraint('disponibilidade', {
      fields: ['profissional_id'],
      type: 'foreign key',
      name: 'disponibilidade_profissional_fk',
      references: { table: 'profissional', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('disponibilidade');
  },
};

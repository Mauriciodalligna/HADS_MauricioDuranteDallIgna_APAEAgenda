'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mural_avisos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      remetente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuario',
          key: 'id'
        }
      },
      conteudo: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      data_publicacao: {
        type: Sequelize.DATE,
        allowNull: false
      },
      setor_destino: {
        type: Sequelize.STRING,
        allowNull: false
      },
      visivel_ate: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mural_avisos');
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remover aluno_id (se existir)
    const table = await queryInterface.describeTable('agendamento');
    if (table.aluno_id) {
      await queryInterface.removeColumn('agendamento', 'aluno_id');
    }

    // Adicionar campos de recorrência
    if (!table.recorrente) {
      await queryInterface.addColumn('agendamento', 'recorrente', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
    }
    if (!table.recorrencia_fim) {
      await queryInterface.addColumn('agendamento', 'recorrencia_fim', { type: Sequelize.DATEONLY, allowNull: true });
    }

    // Garantir status como VARCHAR (STRING)
    // Observação: alguns bancos não permitem alterar facilmente tipos; se já for compatível, ignora-se.
    try {
      await queryInterface.changeColumn('agendamento', 'status', { type: Sequelize.STRING, allowNull: true });
    } catch (e) {
      // noop
    }

    // Índice para busca/conflito
    try {
      await queryInterface.addIndex('agendamento', ['profissional_id', 'data', 'hora_inicio', 'hora_fim'], { name: 'agendamento_prof_data_inicio_fim_idx' });
    } catch (e) {
      // já existe
    }
  },
  async down(queryInterface, Sequelize) {
    // Remover índice
    try { await queryInterface.removeIndex('agendamento', 'agendamento_prof_data_inicio_fim_idx'); } catch {}

    // Remover colunas de recorrência
    try { await queryInterface.removeColumn('agendamento', 'recorrente'); } catch {}
    try { await queryInterface.removeColumn('agendamento', 'recorrencia_fim'); } catch {}

    // Recriar aluno_id (sem FK para trás-compat mínima)
    await queryInterface.addColumn('agendamento', 'aluno_id', { type: Sequelize.INTEGER, allowNull: true });
  }
};



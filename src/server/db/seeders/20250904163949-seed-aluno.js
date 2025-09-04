'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('aluno', [
      {
        nome: 'João da Silva',
        idade: 10,
        turma: 'A1',
        turno: 'Manhã',
        escola_regular: 'Escola Municipal X',
        serie: '4º Ano',
        cidade: 'Marau',
        responsavel_nome: 'Maria da Silva',
        responsavel_telefone: '(54) 99999-0000',
        status: true,
        observacoes: 'Aluno com atendimento de fonoaudiologia.',
        criado_em: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('aluno', { nome: 'João da Silva' });
  }
};

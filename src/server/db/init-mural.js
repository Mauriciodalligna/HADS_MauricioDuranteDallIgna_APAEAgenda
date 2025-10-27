// Script para inicializar a tabela mural_avisos
import { sequelize } from './sequelize.js';

export async function initMuralTable() {
  try {
    console.log('🔌 Verificando tabela mural_avisos...');
    
    // Verificar se a tabela existe
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mural_avisos'
      );
    `);
    
    if (results[0].exists) {
      console.log('📋 Tabela mural_avisos já existe!');
      return true;
    }
    
    console.log('🔨 Criando tabela mural_avisos...');
    
    await sequelize.query(`
      CREATE TABLE mural_avisos (
        id SERIAL PRIMARY KEY,
        remetente_id INTEGER NOT NULL,
        conteudo TEXT NOT NULL,
        data_publicacao TIMESTAMP NOT NULL,
        setor_destino VARCHAR(255) NOT NULL,
        visivel_ate TIMESTAMP NOT NULL
      );
    `);
    
    console.log('✅ Tabela mural_avisos criada com sucesso!');
    return true;
    
  } catch (error) {
    console.error('💥 Erro ao criar tabela mural_avisos:', error.message);
    return false;
  }
}

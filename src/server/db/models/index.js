export { default as Usuario } from "@/server/db/models/usuario";
export { default as Aluno } from "@/server/db/models/aluno";
export { default as Profissional } from "@/server/db/models/profissional";
export { default as Atividade } from "@/server/db/models/atividade";
export { default as Agendamento } from "@/server/db/models/agendamento";
export { default as AgendamentoAluno } from "@/server/db/models/agendamento_aluno";
export { default as MuralAvisos } from "@/server/db/models/mural_avisos";
export { default as LogAcao } from "@/server/db/models/log_acao";
export { default as PasswordResetToken } from "@/server/db/models/password_reset_token";

import Usuario from "@/server/db/models/usuario";
import Aluno from "@/server/db/models/aluno";
import Profissional from "@/server/db/models/profissional";
import Atividade from "@/server/db/models/atividade";
import Agendamento from "@/server/db/models/agendamento";
import AgendamentoAluno from "@/server/db/models/agendamento_aluno";
import MuralAvisos from "@/server/db/models/mural_avisos";
import LogAcao from "@/server/db/models/log_acao";

let associationsInitialized = false;

export function initAssociations() {
  if (associationsInitialized) return;

  // Agendamentos N:N Aluno
  Agendamento.belongsToMany(Aluno, { through: "agendamento_aluno", foreignKey: "agendamento_id", otherKey: "aluno_id" });
  Aluno.belongsToMany(Agendamento, { through: "agendamento_aluno", foreignKey: "aluno_id", otherKey: "agendamento_id" });

  Agendamento.belongsTo(Profissional, { foreignKey: "profissional_id" });
  Profissional.hasMany(Agendamento, { foreignKey: "profissional_id" });

  Agendamento.belongsTo(Atividade, { as: "atividade", foreignKey: "atividade_id" });
  Atividade.hasMany(Agendamento, { foreignKey: "atividade_id" });

  // (Disponibilidade removida)

  // Mural de avisos
  MuralAvisos.belongsTo(Usuario, { as: "remetente", foreignKey: "remetente_id" });
  Usuario.hasMany(MuralAvisos, { as: "avisos", foreignKey: "remetente_id" });

  // Logs de ações
  LogAcao.belongsTo(Usuario, { foreignKey: "usuario_id" });
  Usuario.hasMany(LogAcao, { foreignKey: "usuario_id" });

  associationsInitialized = true;
}



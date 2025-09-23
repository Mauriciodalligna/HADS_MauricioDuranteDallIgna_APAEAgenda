import { DataTypes } from "sequelize";
import sequelize from "@/server/db/sequelize";

export const AgendamentoAluno = sequelize.define(
  "agendamento_aluno",
  {
    agendamento_id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true,
      references: { model: 'agendamento', key: 'id' },
      onDelete: 'CASCADE'
    },
    aluno_id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true,
      references: { model: 'aluno', key: 'id' },
      onDelete: 'RESTRICT'
    },
  },
  {
    tableName: "agendamento_aluno",
    timestamps: false,
  }
);

export default AgendamentoAluno;

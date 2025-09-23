import { DataTypes } from "sequelize";
import sequelize from "@/server/db/sequelize";

export const Agendamento = sequelize.define(
  "agendamento",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    profissional_id: { type: DataTypes.INTEGER },
    atividade_id: { type: DataTypes.INTEGER },
    data: { type: DataTypes.DATEONLY },
    hora_inicio: { type: DataTypes.TIME },
    hora_fim: { type: DataTypes.TIME },
    status: { type: DataTypes.STRING },
    motivo_cancelamento: { type: DataTypes.TEXT },
    observacoes: { type: DataTypes.TEXT },
    recorrente: { type: DataTypes.BOOLEAN, defaultValue: false },
    recorrencia_fim: { type: DataTypes.DATEONLY },
    criado_em: { type: DataTypes.DATE },
  },
  {
    tableName: "agendamento",
    timestamps: false,
  }
);

export default Agendamento;



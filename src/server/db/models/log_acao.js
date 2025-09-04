import { DataTypes } from "sequelize";
import sequelize from "@/server/db/sequelize";

export const LogAcao = sequelize.define(
  "log_acao",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER },
    acao: { type: DataTypes.STRING },
    entidade_afetada: { type: DataTypes.STRING },
    id_entidade: { type: DataTypes.INTEGER },
    timestamp: { type: DataTypes.DATE },
  },
  {
    tableName: "log_acao",
    timestamps: false,
  }
);

export default LogAcao;



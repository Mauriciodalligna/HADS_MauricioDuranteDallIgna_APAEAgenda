import { DataTypes } from "sequelize";
import sequelize from "@/server/db/sequelize";

export const Atividade = sequelize.define(
  "atividade",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING },
    tipo: { type: DataTypes.STRING },
    duracao_padrao: { type: DataTypes.INTEGER },
    cor: { type: DataTypes.STRING },
    status: { type: DataTypes.BOOLEAN },
    criado_em: { type: DataTypes.DATE },
  },
  {
    tableName: "atividade",
    timestamps: false,
  }
);

export default Atividade;



import { DataTypes } from "sequelize";
import sequelize from "@/server/db/sequelize";

export const Aluno = sequelize.define(
  "aluno",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING },
    idade: { type: DataTypes.INTEGER },
    turma: { type: DataTypes.STRING },
    turno: { type: DataTypes.STRING },
    escola_regular: { type: DataTypes.STRING },
    serie: { type: DataTypes.STRING },
    cidade: { type: DataTypes.STRING },
    responsavel_nome: { type: DataTypes.STRING },
    responsavel_telefone: { type: DataTypes.STRING },
    status: { type: DataTypes.BOOLEAN },
    observacoes: { type: DataTypes.TEXT },
    criado_em: { type: DataTypes.DATE },
  },
  {
    tableName: "aluno",
    timestamps: false,
  }
);

export default Aluno;



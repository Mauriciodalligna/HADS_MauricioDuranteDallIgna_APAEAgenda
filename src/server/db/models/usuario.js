import { DataTypes } from "sequelize";
import sequelize from "@/server/db/sequelize";

export const Usuario = sequelize.define(
  "usuario",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true },
    senha: { type: DataTypes.STRING },
    perfil: { type: DataTypes.STRING },
    status: { type: DataTypes.BOOLEAN },
    criado_em: { type: DataTypes.DATE },
  },
  {
    tableName: "usuario",
    timestamps: false,
  }
);

export default Usuario;



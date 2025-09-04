import { DataTypes } from "sequelize";
import sequelize from "@/server/db/sequelize";

export const Profissional = sequelize.define(
  "profissional",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING },
    setor: { type: DataTypes.STRING },
    especialidade: { type: DataTypes.STRING },
    status: { type: DataTypes.BOOLEAN },
    criado_em: { type: DataTypes.DATE },
  },
  {
    tableName: "profissional",
    timestamps: false,
  }
);

export default Profissional;



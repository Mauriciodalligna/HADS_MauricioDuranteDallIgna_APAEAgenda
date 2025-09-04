import { DataTypes } from "sequelize";
import sequelize from "@/server/db/sequelize";

export const MuralAvisos = sequelize.define(
  "mural_avisos",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    remetente_id: { type: DataTypes.INTEGER },
    conteudo: { type: DataTypes.TEXT },
    data_publicacao: { type: DataTypes.DATE },
    setor_destino: { type: DataTypes.STRING },
    visivel_ate: { type: DataTypes.DATE },
  },
  {
    tableName: "mural_avisos",
    timestamps: false,
  }
);

export default MuralAvisos;



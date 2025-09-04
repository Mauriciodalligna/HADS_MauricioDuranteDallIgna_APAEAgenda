import { DataTypes } from "sequelize";
import sequelize from "@/server/db/sequelize";

export const Disponibilidade = sequelize.define(
  "disponibilidade",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    profissional_id: { type: DataTypes.INTEGER },
    dia_semana: { type: DataTypes.STRING },
    hora_inicio: { type: DataTypes.TIME },
    hora_fim: { type: DataTypes.TIME },
  },
  {
    tableName: "disponibilidade",
    timestamps: false,
  }
);

export default Disponibilidade;



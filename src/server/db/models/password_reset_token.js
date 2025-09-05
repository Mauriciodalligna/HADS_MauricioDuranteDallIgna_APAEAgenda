import { DataTypes } from "sequelize";
import sequelize from "@/server/db/sequelize";

export const PasswordResetToken = sequelize.define(
  "password_reset_token",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    token: { type: DataTypes.STRING, allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    used: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    criado_em: { type: DataTypes.DATE },
  },
  { tableName: "password_reset_token", timestamps: false }
);

export default PasswordResetToken;



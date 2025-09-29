const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Garante que não haverá dois usuários com o mesmo email
      validate: {
        isEmail: true, // Valida o formato do email
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'USER'),
      allowNull: false,
      defaultValue: 'USER',
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'PENDING'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
  },
  {
    tableName: "users",
    hooks: {
      // Hook (gatilho) que é executado ANTES de um usuário ser criado/salvo
      beforeSave: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

module.exports = User;

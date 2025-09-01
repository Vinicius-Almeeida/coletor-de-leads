const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const Lead = sequelize.define(
  "Lead",
  {
    // O Sequelize cria um 'id' autoincremental por padrão
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nicho: {
      // <-- ADICIONE ESTE CAMPO NOVO
      type: DataTypes.STRING,
      allowNull: true, // Permitimos nulo para leads antigos que não tinham essa info
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    site: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    endereco: {
      type: DataTypes.TEXT, // Usamos TEXT para endereços que podem ser longos
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    facebook: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instagram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // As colunas createdAt e updatedAt são adicionadas automaticamente
  },
  {
    // Opções do model
    tableName: "leads", // Força o nome da tabela a ser 'leads' em minúsculo
    timestamps: true, // Garante que createdAt e updatedAt sejam gerenciados
  }
);

module.exports = Lead;

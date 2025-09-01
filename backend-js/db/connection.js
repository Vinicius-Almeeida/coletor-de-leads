const { Sequelize } = require("sequelize");
const databaseConfig = require("../config/database");

const sequelize = new Sequelize(databaseConfig);

// Testa a conexão com o banco de dados
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso.");
  } catch (error) {
    console.error("❌ Não foi possível conectar ao banco de dados:", error);
  }
})();

module.exports = sequelize;

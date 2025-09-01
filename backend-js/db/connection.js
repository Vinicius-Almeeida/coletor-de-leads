const { Sequelize } = require("sequelize");
const databaseConfig = require("../config/database");

// Garante que o pg seja carregado corretamente
try {
  require("pg");
  console.log("✅ Pacote pg carregado com sucesso");
} catch (error) {
  console.error("❌ Erro ao carregar pg:", error.message);
  throw error;
}

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

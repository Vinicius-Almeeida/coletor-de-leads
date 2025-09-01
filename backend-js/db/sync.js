const sequelize = require("./connection");
const Lead = require("../models/Lead");
const User = require("../models/User");

// Sincroniza os models com o banco de dados
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso.");

    // Sincroniza os models com o banco de dados
    await sequelize.sync({ alter: true });
    console.log("🔄 Modelos sincronizados com o banco de dados.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro durante a sincronização:", error);
    process.exit(1);
  }
})();

require("dotenv").config(); // Garante que variáveis de .env sejam carregadas localmente

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: "postgres",
  },
  test: {
    // ... configuração de teste, se houver
  },
  production: {
    use_env_variable: "DATABASE_URL", // Linha mais importante!
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Necessário para muitas conexões de produção
      },
    },
  },
};

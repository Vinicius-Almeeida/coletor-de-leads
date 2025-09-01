require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const developmentConfig = {
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5433,
  define: {
    timestamps: true,
    underscored: true,
  },
};

const productionConfig = {
  dialect: "postgres",
  host: process.env.PROD_DB_HOST,
  username: process.env.PROD_DB_USER,
  password: process.env.PROD_DB_PASSWORD,
  database: process.env.PROD_DB_NAME,
  port: process.env.PROD_DB_PORT,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Necessário para a maioria das conexões de nuvem
    },
  },
  define: {
    timestamps: true,
    underscored: true,
  },
};

// Se a variável NODE_ENV for 'production', usa a config de produção.
// Caso contrário, usa a de desenvolvimento.
module.exports =
  process.env.NODE_ENV === "production" ? productionConfig : developmentConfig;

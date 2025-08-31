const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "Teste do servidor funcionando!",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Servidor de teste funcionando!",
    endpoints: ["/api/health"],
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando em: http://localhost:${PORT}`);
  console.log(`📱 API Health: http://localhost:${PORT}/api/health`);
});

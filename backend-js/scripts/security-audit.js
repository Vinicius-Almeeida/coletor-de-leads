#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔒 Iniciando Auditoria de Segurança...\n");

// Função para verificar vulnerabilidades conhecidas
function checkKnownVulnerabilities() {
  console.log("📋 Verificando vulnerabilidades conhecidas...");

  try {
    const result = execSync("npm audit --audit-level=moderate", {
      encoding: "utf8",
    });
    console.log("✅ Nenhuma vulnerabilidade crítica encontrada");
    return true;
  } catch (error) {
    console.log("⚠️ Vulnerabilidades encontradas:");
    console.log(error.stdout);
    return false;
  }
}

// Função para verificar dependências desatualizadas
function checkOutdatedDependencies() {
  console.log("\n📦 Verificando dependências desatualizadas...");

  try {
    const result = execSync("npm outdated", { encoding: "utf8" });
    if (result.trim()) {
      console.log("⚠️ Dependências desatualizadas encontradas:");
      console.log(result);
    } else {
      console.log("✅ Todas as dependências estão atualizadas");
    }
  } catch (error) {
    console.log("✅ Nenhuma dependência desatualizada");
  }
}

// Função para verificar configurações de segurança
function checkSecurityConfig() {
  console.log("\n🔧 Verificando configurações de segurança...");

  const securityChecks = [
    {
      name: "Helmet configurado",
      check: () => {
        const serverContent = fs.readFileSync("server.js", "utf8");
        return serverContent.includes("helmet()");
      },
    },
    {
      name: "Rate limiting configurado",
      check: () => {
        const serverContent = fs.readFileSync("server.js", "utf8");
        return serverContent.includes("limiter");
      },
    },
    {
      name: "CORS configurado",
      check: () => {
        const serverContent = fs.readFileSync("server.js", "utf8");
        return serverContent.includes("cors()");
      },
    },
    {
      name: "Validação de input",
      check: () => {
        const serverContent = fs.readFileSync("server.js", "utf8");
        return serverContent.includes("validateInput");
      },
    },
    {
      name: "Middleware de segurança",
      check: () => {
        return fs.existsSync("middleware/security.js");
      },
    },
  ];

  securityChecks.forEach((check) => {
    if (check.check()) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} - NÃO CONFIGURADO`);
    }
  });
}

// Função para verificar variáveis de ambiente
function checkEnvironmentVariables() {
  console.log("\n🌍 Verificando variáveis de ambiente...");

  const requiredVars = ["GOOGLE_PLACES_API_KEY", "PORT"];

  requiredVars.forEach((varName) => {
    if (process.env[varName]) {
      console.log(`✅ ${varName} configurada`);
    } else {
      console.log(`❌ ${varName} não configurada`);
    }
  });
}

// Função para verificar arquivos sensíveis
function checkSensitiveFiles() {
  console.log("\n📁 Verificando arquivos sensíveis...");

  const sensitiveFiles = [
    ".env",
    ".env.local",
    ".env.production",
    "config.json",
    "secrets.json",
  ];

  sensitiveFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      console.log(`⚠️ Arquivo sensível encontrado: ${file}`);
    } else {
      console.log(`✅ ${file} não encontrado (bom)`);
    }
  });
}

// Função para verificar permissões de arquivos
function checkFilePermissions() {
  console.log("\n🔐 Verificando permissões de arquivos...");

  const criticalFiles = ["server.js", ".env", "package.json"];

  criticalFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      const mode = stats.mode.toString(8);
      console.log(`📄 ${file}: ${mode}`);
    }
  });
}

// Executar todas as verificações
async function runSecurityAudit() {
  try {
    checkKnownVulnerabilities();
    checkOutdatedDependencies();
    checkSecurityConfig();
    checkEnvironmentVariables();
    checkSensitiveFiles();
    checkFilePermissions();

    console.log("\n🎉 Auditoria de segurança concluída!");
    console.log("\n📋 Recomendações:");
    console.log('1. Execute "npm audit fix" para corrigir vulnerabilidades');
    console.log("2. Atualize dependências desatualizadas");
    console.log("3. Configure todas as variáveis de ambiente");
    console.log("4. Revise permissões de arquivos sensíveis");
  } catch (error) {
    console.error("❌ Erro durante auditoria:", error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runSecurityAudit();
}

module.exports = { runSecurityAudit };

// prisma/scripts/createAdmin.ts
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando script de criação de admin...");

  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Erro: E-mail e senha são obrigatórios.");
    console.log("Uso: npm run db:create-admin -- <email> <password>");
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.warn(`Aviso: Usuário com e-mail "${email}" já existe.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const adminUser = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`🎉 Usuário admin criado com sucesso!`);
  console.log(`   Email: ${adminUser.email}`);
  console.log(`   Role: ${adminUser.role}`);
  console.log(`   Status: ${adminUser.status}`);
}

main()
  .catch((e) => {
    console.error("Ocorreu um erro ao executar o script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Script finalizado.");
  });

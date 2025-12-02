const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🔁 Rodando seed da base...");

  // Admin padrão
  const adminEmail = "admin@cantina.com";
  const adminPassword = "admin123";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        name: "Admin Cantina",
        email: adminEmail,
        password: hashed,
        role: "admin",
      },
    });
    console.log(`✅ Admin criado: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log("ℹ️ Admin já existe, pulando criação.");
  }

  // Produtos reais
  const productsData = [
    {
      name: "Coxinha de Frango",
      description: "Coxinha de frango crocante",
      price: 6.0,
      category: "Salgado",
    },
    {
      name: "Pastel de Carne",
      description: "Pastel de carne bem recheado",
      price: 7.0,
      category: "Salgado",
    },
    {
      name: "Pão de Queijo",
      description: "Pão de queijo mineiro",
      price: 4.0,
      category: "Salgado",
    },
    {
      name: "Misto Quente",
      description: "Pão de forma com presunto e queijo",
      price: 8.0,
      category: "Lanche",
    },
    {
      name: "Suco Natural",
      description: "Suco de laranja natural 300ml",
      price: 6.5,
      category: "Bebida",
    },
    {
      name: "Refrigerante Lata",
      description: "Lata 350ml (Coca, Guaraná etc.)",
      price: 5.0,
      category: "Bebida",
    },
    {
      name: "Água Mineral",
      description: "Garrafa 500ml",
      price: 3.0,
      category: "Bebida",
    },
  ];

  for (const p of productsData) {
    const exists = await prisma.product.findFirst({
      where: { name: p.name },
    });
    if (!exists) {
      await prisma.product.create({ data: p });
      console.log(`✅ Produto criado: ${p.name}`);
    } else {
      console.log(`ℹ️ Produto já existe: ${p.name}`);
    }
  }

  console.log("🌱 Seed finalizado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

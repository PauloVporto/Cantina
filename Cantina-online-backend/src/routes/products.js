const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middlewares/auth");

const prisma = new PrismaClient();
const router = express.Router();

// GET /products
router.get("/", authMiddleware, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });
    res.json(products);
  } catch (err) {
    console.error("Erro em GET /products:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

module.exports = router;

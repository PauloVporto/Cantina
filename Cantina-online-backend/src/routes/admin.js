const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

const prisma = new PrismaClient();
const router = express.Router();

// GET /admin/orders -> lista todos os pedidos
router.get("/orders", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });

    const formatted = orders.map((order) => ({
      id: order.id,
      customerName: order.user.name,
      total: order.total,
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      items: order.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        name: it.product.name,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      })),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Erro em GET /admin/orders:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// POST /admin/orders/:id/status -> atualizar status
router.post(
  "/orders/:id/status",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      const validStatus = [
        "recebido",
        "aguardando_pagamento",
        "em_preparo",
        "pronto",
        "entregue",
        "pagamento_recusado",
      ];

      if (!validStatus.includes(status)) {
        return res.status(400).json({ error: "Status inválido." });
      }

      const order = await prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        return res.status(404).json({ error: "Pedido não encontrado." });
      }

      const updated = await prisma.order.update({
        where: { id },
        data: { status },
      });

      res.json(updated);
    } catch (err) {
      console.error("Erro em POST /admin/orders/:id/status:", err);
      res.status(500).json({ error: "Erro interno no servidor." });
    }
  }
);

module.exports = router;

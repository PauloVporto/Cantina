const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middlewares/auth");

const prisma = new PrismaClient();
const router = express.Router();

// POST /orders -> criar pedido
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethod, items, cardData } = req.body;

    if (!paymentMethod || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Forma de pagamento e itens são obrigatórios." });
    }

    // Calcula total e valida produtos
    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        return res
          .status(400)
          .json({ error: `Produto ID ${item.productId} não encontrado.` });
      }
      const quantity = item.quantity || 1;
      const subtotal = product.price * quantity;
      total += subtotal;

      orderItemsData.push({
        productId: product.id,
        quantity,
        unitPrice: product.price,
      });
    }

    let status = "recebido";
    let paymentInfo = null;
    let pixCode = null;

    if (paymentMethod === "pix") {
      status = "aguardando_pagamento";
      pixCode = `PIX-CANTINA-PEDIDO-${Date.now()}`;
      paymentInfo = {
        type: "pix",
        status: "pending",
        pixCode,
        message: "Pagamento Pix simulado.",
      };
    } else if (paymentMethod === "cartao") {
      if (
        !cardData ||
        !cardData.number ||
        !cardData.name ||
        !cardData.expiry ||
        !cardData.cvv
      ) {
        return res.status(400).json({ error: "Dados do cartão incompletos." });
      }

      const lastDigit = cardData.number.trim().slice(-1);
      const approved = !isNaN(lastDigit) && Number(lastDigit) % 2 === 0;

      if (!approved) {
        status = "pagamento_recusado";
        paymentInfo = {
          type: "cartao",
          status: "denied",
          message: "Pagamento recusado (simulação).",
        };
      } else {
        status = "em_preparo";
        paymentInfo = {
          type: "cartao",
          status: "paid",
          message: "Pagamento aprovado (simulação).",
        };
      }
    } else {
      return res.status(400).json({ error: "Forma de pagamento inválida." });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        paymentMethod,
        status,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
        user: true,
      },
    });

    const responseOrder = {
      id: order.id,
      userId: order.userId,
      customerName: order.user.name,
      total: order.total,
      paymentMethod: order.paymentMethod,
      status: order.status,
      createdAt: order.createdAt,
      pixCode: paymentMethod === "pix" ? pixCode : undefined,
      items: order.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        name: it.product.name,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      })),
    };

    return res.status(201).json({
      order: responseOrder,
      payment: paymentInfo,
    });
  } catch (err) {
    console.error("Erro em POST /orders:", err);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// GET /orders -> listar pedidos do usuário logado
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: true } },
      },
    });

    const formatted = orders.map((order) => ({
      id: order.id,
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
    console.error("Erro em GET /orders:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// GET /orders/:id -> detalhes de 1 pedido
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    if (order.userId !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Você não pode ver este pedido." });
    }

    const responseOrder = {
      id: order.id,
      userId: order.userId,
      customerName: order.user.name,
      total: order.total,
      paymentMethod: order.paymentMethod,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        name: it.product.name,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      })),
    };

    res.json(responseOrder);
  } catch (err) {
    console.error("Erro em GET /orders/:id:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// POST /orders/:id/pay-pix -> simular confirmação de Pix
router.post("/:id/pay-pix", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    if (order.userId !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Você não pode alterar este pedido." });
    }

    if (order.paymentMethod !== "pix") {
      return res.status(400).json({ error: "Este pedido não é Pix." });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: "em_preparo" },
    });

    res.json({
      message: "Pagamento Pix confirmado (simulação).",
      order: updated,
    });
  } catch (err) {
    console.error("Erro em POST /orders/:id/pay-pix:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

module.exports = router;

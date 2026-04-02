const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = __dirname;
const dataFile = path.join(root, "data", "app-data.json");
const port = Number(process.env.PORT || 3000);
const publicBaseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${port}`;

const staticTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function readStore() {
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function writeStore(store) {
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }
  const { password, ...safe } = user;
  return safe;
}

function serveStatic(req, res) {
  const requested = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const filePath = path.join(root, requested);

  if (!filePath.startsWith(root)) {
    sendJson(res, 403, { error: "forbidden" });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      fs.readFile(path.join(root, "index.html"), (fallbackError, fallbackContent) => {
        if (fallbackError) {
          sendJson(res, 404, { error: "not_found" });
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(fallbackContent);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": staticTypes[ext] || "application/octet-stream" });
    res.end(content);
  });
}

function randomState() {
  return crypto.randomBytes(16).toString("hex");
}

function ensureOAuthConfig(provider) {
  if (provider === "google") {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }
  if (provider === "apple") {
    return Boolean(process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY);
  }
  return false;
}

function upsertOAuthUser(store, provider, profile) {
  const providerKey = `${provider}Id`;
  let user = store.users.find((entry) => entry[providerKey] === profile.id || entry.email?.toLowerCase() === profile.email.toLowerCase());

  if (!user) {
    user = {
      id: createId("user"),
      name: profile.name || profile.email.split("@")[0],
      phone: "",
      email: profile.email.toLowerCase(),
      password: "",
      role: "customer",
      monthlyEnabled: false,
      [providerKey]: profile.id
    };
    store.users.push(user);
  } else {
    user[providerKey] = profile.id;
    if (!user.name && profile.name) {
      user.name = profile.name;
    }
  }

  return user;
}

async function fetchGoogleProfile(code) {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${publicBaseUrl}/api/auth/google/callback`
    })
  });

  if (!tokenResponse.ok) {
    throw new Error("Falha ao trocar codigo do Google por token.");
  }

  const tokenData = await tokenResponse.json();
  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });

  if (!profileResponse.ok) {
    throw new Error("Falha ao buscar perfil do Google.");
  }

  const profile = await profileResponse.json();
  return {
    id: profile.sub,
    email: profile.email,
    name: profile.name
  };
}

async function createMercadoPagoPreference(order) {
  if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
    return {
      mode: "manual",
      checkoutUrl: null,
      message: "MERCADO_PAGO_ACCESS_TOKEN nao configurado. O pedido ficara pendente para aprovacao manual."
    };
  }

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: [
        {
          title: `Pedido ${order.id}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: order.total
        }
      ],
      external_reference: order.id,
      notification_url: `${publicBaseUrl}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${publicBaseUrl}/?payment=success`,
        pending: `${publicBaseUrl}/?payment=pending`,
        failure: `${publicBaseUrl}/?payment=failure`
      }
    })
  });

  if (!response.ok) {
    throw new Error("Falha ao criar preferencia no Mercado Pago.");
  }

  const data = await response.json();
  return {
    mode: "mercado_pago",
    checkoutUrl: data.init_point || data.sandbox_init_point || null,
    preferenceId: data.id || null
  };
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const store = readStore();

  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, mode: "local-node-api" });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/public-config") {
    sendJson(res, 200, {
      settings: store.settings,
      oauth: {
        googleReady: ensureOAuthConfig("google"),
        appleReady: ensureOAuthConfig("apple")
      },
      mercadoPagoReady: Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN),
      mobileLink: publicBaseUrl
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/auth/google/start") {
    if (!ensureOAuthConfig("google")) {
      sendJson(res, 400, { error: "google_not_configured", detail: "Preencha GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET." });
      return;
    }
    const stateValue = randomState();
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.search = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${publicBaseUrl}/api/auth/google/callback`,
      response_type: "code",
      scope: "openid email profile",
      state: stateValue,
      access_type: "offline",
      prompt: "consent"
    }).toString();
    redirect(res, authUrl.toString());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/auth/google/callback") {
    if (!ensureOAuthConfig("google")) {
      sendJson(res, 400, { error: "google_not_configured" });
      return;
    }
    const code = url.searchParams.get("code");
    if (!code) {
      sendJson(res, 400, { error: "missing_code" });
      return;
    }
    const profile = await fetchGoogleProfile(code);
    const user = upsertOAuthUser(store, "google", profile);
    writeStore(store);
    redirect(res, `/?oauth=google-success&email=${encodeURIComponent(user.email)}`);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/auth/apple/start") {
    if (!ensureOAuthConfig("apple")) {
      sendJson(res, 400, { error: "apple_not_configured", detail: "Preencha APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID e APPLE_PRIVATE_KEY." });
      return;
    }
    const stateValue = randomState();
    const authUrl = new URL("https://appleid.apple.com/auth/authorize");
    authUrl.search = new URLSearchParams({
      client_id: process.env.APPLE_CLIENT_ID,
      redirect_uri: `${publicBaseUrl}/api/auth/apple/callback`,
      response_type: "code",
      response_mode: "query",
      scope: "name email",
      state: stateValue
    }).toString();
    redirect(res, authUrl.toString());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/auth/apple/callback") {
    if (!ensureOAuthConfig("apple")) {
      sendJson(res, 400, { error: "apple_not_configured" });
      return;
    }
    const code = url.searchParams.get("code");
    if (!code) {
      sendJson(res, 400, { error: "missing_code", detail: "O callback da Apple chegou sem codigo." });
      return;
    }
    const fakeEmail = `apple-${code.slice(0, 8)}@placeholder.local`;
    const user = upsertOAuthUser(store, "apple", {
      id: code,
      email: fakeEmail,
      name: "Conta Apple"
    });
    writeStore(store);
    redirect(res, `/?oauth=apple-success&email=${encodeURIComponent(user.email)}`);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await parseBody(req);
    const user = store.users.find((entry) => entry.email?.toLowerCase() === String(body.email || "").toLowerCase() && entry.password === body.password);
    if (!user) {
      sendJson(res, 401, { error: "invalid_credentials" });
      return;
    }
    sendJson(res, 200, { user: sanitizeUser(user), token: createId("session") });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/auth/register") {
    const body = await parseBody(req);
    if (!body.name || !body.email || !body.password) {
      sendJson(res, 400, { error: "missing_fields" });
      return;
    }
    if (store.users.some((entry) => entry.email.toLowerCase() === String(body.email).toLowerCase())) {
      sendJson(res, 409, { error: "email_exists" });
      return;
    }
    const user = {
      id: createId("user"),
      name: body.name,
      phone: body.phone || "",
      email: String(body.email).toLowerCase(),
      password: body.password,
      role: "customer",
      monthlyEnabled: Boolean(body.monthlyEnabled)
    };
    store.users.push(user);
    writeStore(store);
    sendJson(res, 201, { user: sanitizeUser(user) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/orders") {
    const body = await parseBody(req);
    const order = {
      id: createId("order"),
      userId: body.userId || null,
      customerName: body.customerName || "Cliente",
      items: Array.isArray(body.items) ? body.items : [],
      total: Number(body.total || 0),
      paymentMethod: body.paymentMethod || "pix",
      paymentStatus: body.paymentStatus || "pending",
      status: body.status || "awaiting_payment_confirmation",
      note: body.note || "",
      createdAt: new Date().toISOString()
    };

    if (order.paymentMethod === "card_app") {
      const preference = await createMercadoPagoPreference(order);
      order.gateway = preference.mode;
      order.gatewayReference = preference.preferenceId || null;
      order.checkoutUrl = preference.checkoutUrl || null;
    }

    store.orders.unshift(order);
    writeStore(store);
    sendJson(res, 201, { order });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/webhooks/mercadopago") {
    const body = await parseBody(req);
    const externalReference = body?.data?.id || body?.external_reference || body?.resource || null;
    const order = store.orders.find((entry) => entry.id === externalReference || entry.gatewayReference === externalReference);
    if (!order) {
      sendJson(res, 404, { error: "order_not_found" });
      return;
    }
    order.paymentStatus = "approved";
    order.status = "approved";
    writeStore(store);
    sendJson(res, 200, { ok: true, orderId: order.id });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/approve-payment") {
    const body = await parseBody(req);
    const order = store.orders.find((entry) => entry.id === body.orderId);
    if (!order) {
      sendJson(res, 404, { error: "order_not_found" });
      return;
    }
    order.paymentStatus = "approved";
    order.status = "approved";
    writeStore(store);
    sendJson(res, 200, { order });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/reject-payment") {
    const body = await parseBody(req);
    const order = store.orders.find((entry) => entry.id === body.orderId);
    if (!order) {
      sendJson(res, 404, { error: "order_not_found" });
      return;
    }
    order.paymentStatus = "rejected";
    order.status = "payment_rejected";
    writeStore(store);
    sendJson(res, 200, { order });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/settings") {
    const body = await parseBody(req);
    store.settings = {
      ...store.settings,
      ...body,
      paymentMethods: {
        ...store.settings.paymentMethods,
        ...(body.paymentMethods || {})
      },
      paymentGateways: {
        ...store.settings.paymentGateways,
        ...(body.paymentGateways || {})
      }
    };
    writeStore(store);
    sendJson(res, 200, { settings: store.settings });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/cash-close") {
    const body = await parseBody(req);
    const closing = {
      id: createId("cash"),
      cashAmount: Number(body.cashAmount || 0),
      expense: Number(body.expense || 0),
      note: body.note || "",
      createdAt: new Date().toISOString()
    };
    store.cashClosings.unshift(closing);
    writeStore(store);
    sendJson(res, 201, { closing });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/stock-movement") {
    const body = await parseBody(req);
    const product = store.products.find((entry) => entry.id === body.productId);
    if (!product) {
      sendJson(res, 404, { error: "product_not_found" });
      return;
    }
    const quantity = Number(body.quantity || 0);
    product.stock = Math.max(Number(product.stock || 0) + quantity, 0);
    const movement = {
      id: createId("stock"),
      productId: product.id,
      productName: product.name,
      quantity,
      note: body.note || "",
      createdAt: new Date().toISOString()
    };
    store.stockMovements.unshift(movement);
    writeStore(store);
    sendJson(res, 201, { movement, product });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/mobile-link") {
    sendJson(res, 200, {
      localNetworkExample: `http://SEU-IP-LOCAL:${port}`,
      publicDeployHint: "Publique em Vercel, Railway, Render ou Netlify para gerar um link publico",
      publicBaseUrl
    });
    return;
  }

  sendJson(res, 404, { error: "api_not_found" });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/")) {
      await handleApi(req, res);
      return;
    }
    serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { error: "server_error", detail: error.message });
  }
});

server.listen(port, () => {
  console.log(`Cantina Express rodando em http://localhost:${port}`);
});

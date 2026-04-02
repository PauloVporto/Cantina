const placeholderImage = "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80";
const storageKey = "cantina-express-v3";

const defaultUsers = [
  { id: crypto.randomUUID(), name: "Administrador", phone: "11999990000", email: "admin@cantina.com", password: "123456", role: "admin", monthlyEnabled: false },
  { id: crypto.randomUUID(), name: "Funcionaria", phone: "11988887777", email: "funcionaria@cantina.com", password: "123456", role: "employee", monthlyEnabled: false },
  { id: crypto.randomUUID(), name: "Mariana Souza", phone: "11987654321", email: "mariana@cantina.com", password: "123456", role: "customer", monthlyEnabled: true }
];

const defaultProducts = [
  { id: crypto.randomUUID(), name: "Coxinha de frango", category: "Salgados", description: "Massa crocante com recheio cremoso.", price: 8.5, stock: 18, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=80" },
  { id: crypto.randomUUID(), name: "Cafe coado", category: "Bebidas", description: "Cafe passado na hora e servido quente.", price: 4.5, stock: 30, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80" },
  { id: crypto.randomUUID(), name: "Suco natural", category: "Bebidas", description: "Sabores laranja, uva ou maracuja.", price: 9, stock: 12, image: "https://images.unsplash.com/photo-1600271886742-f049cd5bba3f?auto=format&fit=crop&w=900&q=80" },
  { id: crypto.randomUUID(), name: "Bolo do dia", category: "Doces", description: "Fatia do sabor disponivel na vitrine.", price: 8, stock: 7, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80" }
];

function monthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
}

function dueDateForMonth(offset = 0) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + offset, 30, 23, 59, 59).toISOString();
}

const initialState = {
  users: defaultUsers,
  products: defaultProducts,
  settings: {
    pixKey: "admin@cantina.com",
    paymentMethods: { pix: true, card_app: true, card_store: true, monthly: true },
    paymentGateways: { google: false, icloud: false, mercadoPago: false }
  },
  orders: [
    {
      id: crypto.randomUUID(),
      userId: defaultUsers[2].id,
      customerName: defaultUsers[2].name,
      items: [{ productId: defaultProducts[0].id, name: "Coxinha de frango", quantity: 2, unitPrice: 8.5 }],
      total: 17,
      paymentMethod: "monthly",
      paymentStatus: "approved",
      status: "pending_monthly",
      note: "Lancar na conta",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 36).toISOString()
    },
    {
      id: crypto.randomUUID(),
      userId: defaultUsers[2].id,
      customerName: defaultUsers[2].name,
      items: [{ productId: defaultProducts[1].id, name: "Cafe coado", quantity: 1, unitPrice: 4.5 }],
      total: 4.5,
      paymentMethod: "pix",
      paymentStatus: "pending",
      status: "awaiting_payment_confirmation",
      note: "",
      createdAt: new Date().toISOString()
    }
  ],
  monthlyAccounts: [
    {
      id: crypto.randomUUID(),
      userId: defaultUsers[2].id,
      monthRef: monthStart(new Date(Date.now() - 1000 * 60 * 60 * 24 * 36)),
      total: 17,
      paid: 0,
      dueDate: dueDateForMonth(-1),
      status: "overdue",
      orderIds: []
    }
  ],
  cashClosings: [],
  stockMovements: [],
  cart: [],
  sessionUserId: null
};

const state = loadState();

const elements = {
  authView: document.querySelector("#auth-view"),
  appView: document.querySelector("#app-view"),
  adminView: document.querySelector("#admin-view"),
  customerView: document.querySelector("#customer-view"),
  employeeView: document.querySelector("#employee-view"),
  authTabs: document.querySelectorAll(".auth-tab"),
  loginForm: document.querySelector("#login-form"),
  registerForm: document.querySelector("#register-form"),
  authMessage: document.querySelector("#auth-message"),
  googleAuthButton: document.querySelector("#google-auth-button"),
  icloudAuthButton: document.querySelector("#icloud-auth-button"),
  loginEmail: document.querySelector("#login-email"),
  loginPassword: document.querySelector("#login-password"),
  registerName: document.querySelector("#register-name"),
  registerPhone: document.querySelector("#register-phone"),
  registerEmail: document.querySelector("#register-email"),
  registerPassword: document.querySelector("#register-password"),
  registerMonthly: document.querySelector("#register-monthly"),
  welcomeTitle: document.querySelector("#welcome-title"),
  welcomeSubtitle: document.querySelector("#welcome-subtitle"),
  roleChip: document.querySelector("#role-chip"),
  logoutButton: document.querySelector("#logout-button"),
  searchInput: document.querySelector("#search-input"),
  productGrid: document.querySelector("#product-grid"),
  cartList: document.querySelector("#cart-list"),
  subtotalValue: document.querySelector("#subtotal-value"),
  totalValue: document.querySelector("#total-value"),
  clearCartButton: document.querySelector("#clear-cart-button"),
  finishOrderButton: document.querySelector("#finish-order-button"),
  orderNote: document.querySelector("#order-note"),
  paymentMethodOptions: document.querySelector("#payment-method-options"),
  paymentInfo: document.querySelector("#payment-info"),
  accountSummary: document.querySelector("#account-summary"),
  customerOrdersList: document.querySelector("#customer-orders-list"),
  customerMonthlyTotal: document.querySelector("#customer-monthly-total"),
  customerDueDate: document.querySelector("#customer-due-date"),
  customerOverdueState: document.querySelector("#customer-overdue-state"),
  customerOrdersCount: document.querySelector("#customer-orders-count"),
  adminRevenue: document.querySelector("#admin-revenue"),
  adminExpenses: document.querySelector("#admin-expenses"),
  adminOpenDebt: document.querySelector("#admin-open-debt"),
  adminOverdueCount: document.querySelector("#admin-overdue-count"),
  adminOrdersCount: document.querySelector("#admin-orders-count"),
  financeChart: document.querySelector("#finance-chart"),
  adminOrderForm: document.querySelector("#admin-order-form"),
  adminOrderCustomer: document.querySelector("#admin-order-customer"),
  adminOrderTotal: document.querySelector("#admin-order-total"),
  adminOrderPayment: document.querySelector("#admin-order-payment"),
  adminOrderItems: document.querySelector("#admin-order-items"),
  adminOrderNote: document.querySelector("#admin-order-note"),
  settingsForm: document.querySelector("#settings-form"),
  adminPixKey: document.querySelector("#admin-pix-key"),
  paymentPixEnabled: document.querySelector("#payment-pix-enabled"),
  paymentCardEnabled: document.querySelector("#payment-card-enabled"),
  paymentMonthlyEnabled: document.querySelector("#payment-monthly-enabled"),
  debtorsList: document.querySelector("#debtors-list"),
  stockAdminList: document.querySelector("#stock-admin-list"),
  pendingPaymentsList: document.querySelector("#pending-payments-list"),
  adminOrdersList: document.querySelector("#admin-orders-list"),
  productForm: document.querySelector("#product-form"),
  productFormReset: document.querySelector("#product-form-reset"),
  productId: document.querySelector("#product-id"),
  productName: document.querySelector("#product-name"),
  productCategory: document.querySelector("#product-category"),
  productPrice: document.querySelector("#product-price"),
  productStock: document.querySelector("#product-stock"),
  productDescription: document.querySelector("#product-description"),
  productImageUrl: document.querySelector("#product-image-url"),
  productImageFile: document.querySelector("#product-image-file"),
  adminProductList: document.querySelector("#admin-product-list"),
  employeeCashTotal: document.querySelector("#employee-cash-total"),
  employeeStockEvents: document.querySelector("#employee-stock-events"),
  employeeLastClose: document.querySelector("#employee-last-close"),
  employeePendingCount: document.querySelector("#employee-pending-count"),
  cashForm: document.querySelector("#cash-form"),
  cashAmount: document.querySelector("#cash-amount"),
  cashExpense: document.querySelector("#cash-expense"),
  cashNote: document.querySelector("#cash-note"),
  stockMoveForm: document.querySelector("#stock-move-form"),
  stockMoveProduct: document.querySelector("#stock-move-product"),
  stockMoveQuantity: document.querySelector("#stock-move-quantity"),
  stockMoveNote: document.querySelector("#stock-move-note"),
  employeeLogList: document.querySelector("#employee-log-list")
};

const templates = {
  productCard: document.querySelector("#product-card-template"),
  cartItem: document.querySelector("#cart-item-template"),
  orderItem: document.querySelector("#order-item-template")
};

bindEvents();
renderApp();

function bindEvents() {
  elements.authTabs.forEach((button) => button.addEventListener("click", () => switchAuthTab(button.dataset.authTab)));
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.registerForm.addEventListener("submit", handleRegister);
  elements.googleAuthButton.addEventListener("click", () => {
    window.location.href = "/api/auth/google/start";
  });
  elements.icloudAuthButton.addEventListener("click", () => {
    window.location.href = "/api/auth/apple/start";
  });
  elements.logoutButton.addEventListener("click", logout);
  elements.searchInput.addEventListener("input", renderCustomerProducts);
  elements.clearCartButton.addEventListener("click", clearCart);
  elements.finishOrderButton.addEventListener("click", finishOrder);
  elements.settingsForm.addEventListener("submit", handleSettingsSubmit);
  elements.adminOrderForm.addEventListener("submit", handleAdminOrderSubmit);
  elements.productForm.addEventListener("submit", handleProductSubmit);
  elements.productFormReset.addEventListener("click", resetProductForm);
  elements.cashForm.addEventListener("submit", handleCashSubmit);
  elements.stockMoveForm.addEventListener("submit", handleStockMovementSubmit);
}

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return structuredClone(initialState);
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      users: normalizeUsers(parsed.users),
      products: Array.isArray(parsed.products) && parsed.products.length ? parsed.products : structuredClone(initialState.products),
      settings: normalizeSettings(parsed.settings),
      orders: Array.isArray(parsed.orders) ? parsed.orders : structuredClone(initialState.orders),
      monthlyAccounts: Array.isArray(parsed.monthlyAccounts) ? parsed.monthlyAccounts : structuredClone(initialState.monthlyAccounts),
      cashClosings: Array.isArray(parsed.cashClosings) ? parsed.cashClosings : [],
      stockMovements: Array.isArray(parsed.stockMovements) ? parsed.stockMovements : [],
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      sessionUserId: parsed.sessionUserId ?? null
    };
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function normalizeUsers(users) {
  const baseUsers = Array.isArray(users) && users.length ? users : structuredClone(initialState.users);
  let adminSeen = false;
  return baseUsers.map((user) => {
    const normalized = { ...user };
    if (normalized.role === "admin") {
      if (!adminSeen) {
        adminSeen = true;
      } else {
        normalized.role = "customer";
      }
    }
    return normalized;
  });
}

function normalizeSettings(settings) {
  return {
    pixKey: settings?.pixKey ?? initialState.settings.pixKey,
    paymentMethods: {
      pix: settings?.paymentMethods?.pix ?? initialState.settings.paymentMethods.pix,
      card_app: settings?.paymentMethods?.card_app ?? initialState.settings.paymentMethods.card_app,
      card_store: settings?.paymentMethods?.card_store ?? initialState.settings.paymentMethods.card_store,
      monthly: settings?.paymentMethods?.monthly ?? initialState.settings.paymentMethods.monthly
    },
    paymentGateways: {
      google: settings?.paymentGateways?.google ?? false,
      icloud: settings?.paymentGateways?.icloud ?? false,
      mercadoPago: settings?.paymentGateways?.mercadoPago ?? false
    }
  };
}

function renderApp() {
  const currentUser = getCurrentUser();
  elements.authView.classList.toggle("is-hidden", Boolean(currentUser));
  elements.appView.classList.toggle("is-hidden", !currentUser);

  if (!currentUser) {
    saveState();
    return;
  }

  const role = currentUser.role;
  elements.welcomeTitle.textContent = `Ola, ${currentUser.name}`;
  elements.welcomeSubtitle.textContent = role === "admin"
    ? "Painel administrativo com aprovacoes, balanco, pedidos e estoque."
    : role === "employee"
      ? "Tela operacional da funcionaria para caixa e estoque."
      : "Escolha seus itens e acompanhe sua conta mensal.";
  elements.roleChip.textContent = role === "admin" ? "Administrador unico" : role === "employee" ? "Funcionaria" : "Usuario comum";
  elements.adminView.classList.toggle("is-hidden", role !== "admin");
  elements.customerView.classList.toggle("is-hidden", role !== "customer");
  elements.employeeView.classList.toggle("is-hidden", role !== "employee");

  if (role === "admin") {
    renderAdminDashboard();
  } else if (role === "employee") {
    renderEmployeeDashboard();
  } else {
    renderCustomerDashboard(currentUser);
  }

  saveState();
}

function switchAuthTab(tab) {
  elements.authTabs.forEach((button) => button.classList.toggle("is-active", button.dataset.authTab === tab));
  elements.loginForm.classList.toggle("is-hidden", tab !== "login");
  elements.registerForm.classList.toggle("is-hidden", tab !== "register");
  setStatus("");
}

function handleLogin(event) {
  event.preventDefault();
  const email = elements.loginEmail.value.trim().toLowerCase();
  const password = elements.loginPassword.value;
  const user = state.users.find((entry) => entry.email.toLowerCase() === email && entry.password === password);

  if (!user) {
    setStatus("E-mail ou senha invalidos.");
    return;
  }

  state.sessionUserId = user.id;
  elements.loginForm.reset();
  setStatus("");
  renderApp();
}

function handleRegister(event) {
  event.preventDefault();
  const email = elements.registerEmail.value.trim().toLowerCase();
  const phone = sanitizePhone(elements.registerPhone.value);

  if (!elements.registerName.value.trim() || !email || !elements.registerPassword.value) {
    setStatus("Preencha nome, e-mail e senha.");
    return;
  }

  if (!phone) {
    setStatus("Informe um telefone valido.");
    return;
  }

  if (state.users.some((user) => user.email.toLowerCase() === email)) {
    setStatus("Ja existe uma conta com esse e-mail.");
    return;
  }

  state.users.push({
    id: crypto.randomUUID(),
    name: elements.registerName.value.trim(),
    phone,
    email,
    password: elements.registerPassword.value,
    role: "customer",
    monthlyEnabled: elements.registerMonthly.checked
  });

  elements.registerForm.reset();
  switchAuthTab("login");
  setStatus("Conta criada com sucesso. Integracoes Google e iCloud ficam prontas para backend.");
  saveState();
}

function logout() {
  state.sessionUserId = null;
  state.cart = [];
  renderApp();
}

function renderCustomerDashboard(user) {
  renderCustomerProducts();
  renderPaymentMethods(user);
  renderCart();
  renderCustomerOrders(user);
  renderCustomerAccount(user);
}

function renderCustomerProducts() {
  const searchTerm = elements.searchInput.value.trim().toLowerCase();
  const products = state.products.filter((product) => `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(searchTerm));

  elements.productGrid.innerHTML = "";
  if (!products.length) {
    elements.productGrid.appendChild(createEmptyState("Nenhum produto encontrado."));
    return;
  }

  products.forEach((product) => {
    const fragment = templates.productCard.content.cloneNode(true);
    const button = fragment.querySelector("button");
    const image = fragment.querySelector(".product-card__image");
    image.src = product.image || placeholderImage;
    image.alt = product.name;
    fragment.querySelector(".product-card__category").textContent = product.category;
    fragment.querySelector("h3").textContent = product.name;
    fragment.querySelector("p").textContent = product.description;
    fragment.querySelector(".product-card__price").textContent = formatCurrency(product.price);
    fragment.querySelector(".product-card__stock").textContent = `${product.stock} em estoque`;

    if (product.stock === 0) {
      button.disabled = true;
      button.textContent = "Esgotado";
      button.style.opacity = "0.55";
    } else {
      button.addEventListener("click", () => addToCart(product.id));
    }

    elements.productGrid.appendChild(fragment);
  });
}

function renderPaymentMethods(user) {
  const methods = [];
  if (state.settings.paymentMethods.pix) {
    methods.push({ id: "pix", label: "Pix no app" });
  }
  if (state.settings.paymentMethods.card_app) {
    methods.push({ id: "card_app", label: "Cartao no app" });
  }
  if (state.settings.paymentMethods.card_store) {
    methods.push({ id: "card_store", label: "Cartao presencial" });
  }
  if (state.settings.paymentMethods.monthly && user.monthlyEnabled) {
    methods.push({ id: "monthly", label: "Conta mensal" });
  }

  elements.paymentMethodOptions.innerHTML = "";

  if (!methods.length) {
    elements.finishOrderButton.disabled = true;
    elements.paymentMethodOptions.appendChild(createEmptyState("Nenhum meio de pagamento liberado pelo administrador."));
    renderPaymentInfo();
    return;
  }

  elements.finishOrderButton.disabled = false;
  methods.forEach((method, index) => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="radio" name="payment-method" value="${method.id}" ${index === 0 ? "checked" : ""}> ${method.label}`;
    label.querySelector("input").addEventListener("change", renderPaymentInfo);
    elements.paymentMethodOptions.appendChild(label);
  });
  renderPaymentInfo();
}

function renderPaymentInfo() {
  const selected = document.querySelector('input[name="payment-method"]:checked')?.value;
  if (selected === "pix") {
    elements.paymentInfo.classList.remove("is-hidden");
    elements.paymentInfo.innerHTML = `<strong>Pix com autenticacao</strong><p>Chave do administrador: <strong>${state.settings.pixKey || "Nao configurada"}</strong>. O pedido fica pendente ate confirmacao do pagamento.</p>`;
    return;
  }

  if (selected === "card_app") {
    elements.paymentInfo.classList.remove("is-hidden");
    elements.paymentInfo.innerHTML = `<strong>Cartao no app</strong><p>Fluxo preparado para autenticacao por conta Mercado Pago. Nesta versao, o pedido entra como pendente para aprovacao.</p>`;
    return;
  }

  if (selected === "card_store") {
    elements.paymentInfo.classList.remove("is-hidden");
    elements.paymentInfo.innerHTML = `<strong>Cartao presencial</strong><p>O pagamento sera passado na maquina da cantina e precisara ser aprovado no sistema.</p>`;
    return;
  }

  if (selected === "monthly") {
    elements.paymentInfo.classList.remove("is-hidden");
    elements.paymentInfo.innerHTML = `<strong>Conta mensal</strong><p>Seu pedido sera anotado e cobrado no fechamento do mes.</p>`;
    return;
  }

  elements.paymentInfo.classList.add("is-hidden");
  elements.paymentInfo.innerHTML = "";
}

function renderCart() {
  elements.cartList.innerHTML = "";
  if (!state.cart.length) {
    elements.cartList.appendChild(createEmptyState("Seu carrinho esta vazio."));
  } else {
    state.cart.forEach((item) => {
      const product = getProduct(item.productId);
      if (!product) {
        return;
      }
      const fragment = templates.cartItem.content.cloneNode(true);
      fragment.querySelector("h3").textContent = product.name;
      fragment.querySelector("p").textContent = `${formatCurrency(product.price)} cada`;
      fragment.querySelector(".cart-item__qty").textContent = item.quantity;
      fragment.querySelector(".qty-button--minus").addEventListener("click", () => updateCartQuantity(product.id, -1));
      fragment.querySelector(".qty-button--plus").addEventListener("click", () => updateCartQuantity(product.id, 1));
      elements.cartList.appendChild(fragment);
    });
  }
  const total = cartTotal();
  elements.subtotalValue.textContent = formatCurrency(total);
  elements.totalValue.textContent = formatCurrency(total);
}

function renderCustomerOrders(user) {
  const orders = state.orders.filter((order) => order.userId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  elements.customerOrdersList.innerHTML = "";
  elements.customerOrdersCount.textContent = String(orders.length);

  if (!orders.length) {
    elements.customerOrdersList.appendChild(createEmptyState("Voce ainda nao fez pedidos."));
    return;
  }

  orders.forEach((order) => elements.customerOrdersList.appendChild(buildOrderCard(order)));
}

function renderCustomerAccount(user) {
  const accounts = state.monthlyAccounts.filter((account) => account.userId === user.id).map(withAccountStatus).sort((a, b) => new Date(b.monthRef) - new Date(a.monthRef));
  const openAmount = accounts.reduce((sum, account) => sum + Math.max(account.total - account.paid, 0), 0);
  const nearestAccount = accounts[0];
  const hasOverdue = accounts.some((account) => account.status === "overdue");
  elements.customerMonthlyTotal.textContent = formatCurrency(openAmount);
  elements.customerDueDate.textContent = nearestAccount ? formatDate(nearestAccount.dueDate) : "-";
  elements.customerOverdueState.textContent = hasOverdue ? "Em atraso" : "Em dia";
  elements.customerOverdueState.style.color = hasOverdue ? "var(--danger)" : "var(--success)";
  elements.accountSummary.innerHTML = "";

  if (!accounts.length) {
    elements.accountSummary.appendChild(createEmptyState("Sem lancamentos em conta mensal."));
    return;
  }

  accounts.forEach((account) => {
    const card = document.createElement("article");
    card.className = "account-card";
    card.innerHTML = `<h3>${formatMonthLabel(account.monthRef)}</h3><p>Total lancado: <strong>${formatCurrency(account.total)}</strong></p><p>Pago: ${formatCurrency(account.paid)}</p><p>Vencimento: ${formatDate(account.dueDate)}</p><span class="badge ${badgeClass(account.status)}">${statusLabel(account.status)}</span>`;
    elements.accountSummary.appendChild(card);
  });
}

function renderAdminDashboard() {
  const accounts = state.monthlyAccounts.map(withAccountStatus);
  const approvedRevenue = state.orders.filter((order) => isRevenueOrder(order)).reduce((sum, order) => sum + order.total, 0);
  const expenses = monthExpenses();
  const openDebt = accounts.reduce((sum, account) => sum + Math.max(account.total - account.paid, 0), 0);
  const overdueCount = accounts.filter((account) => account.status === "overdue").length;

  elements.adminRevenue.textContent = formatCurrency(approvedRevenue);
  elements.adminExpenses.textContent = formatCurrency(expenses);
  elements.adminOpenDebt.textContent = formatCurrency(openDebt);
  elements.adminOverdueCount.textContent = String(overdueCount);
  elements.adminOrdersCount.textContent = String(state.orders.length);

  fillSettingsForm();
  renderDebtors(accounts);
  renderStockOverview();
  renderPendingPayments();
  renderAdminOrders();
  renderFinanceChart();
  renderAdminProducts();
}

function renderEmployeeDashboard() {
  const today = new Date().toDateString();
  const todayClosing = state.cashClosings.filter((entry) => new Date(entry.createdAt).toDateString() === today);
  const todayCash = todayClosing.reduce((sum, entry) => sum + entry.cashAmount, 0);
  const lastClose = state.cashClosings[0];
  const pendingPayments = state.orders.filter((order) => order.paymentStatus === "pending").length;

  elements.employeeCashTotal.textContent = formatCurrency(todayCash);
  elements.employeeStockEvents.textContent = String(state.stockMovements.length);
  elements.employeeLastClose.textContent = lastClose ? formatDateTime(lastClose.createdAt) : "-";
  elements.employeePendingCount.textContent = String(pendingPayments);
  renderStockMoveOptions();
  renderEmployeeLogs();
}

function renderDebtors(accounts) {
  const pending = accounts.filter((account) => Math.max(account.total - account.paid, 0) > 0).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  elements.debtorsList.innerHTML = "";

  if (!pending.length) {
    elements.debtorsList.appendChild(createEmptyState("Nenhum devedor no momento."));
    return;
  }

  pending.forEach((account) => {
    const user = getUser(account.userId);
    const balance = Math.max(account.total - account.paid, 0);
    const whatsappUrl = `https://wa.me/55${sanitizePhone(user.phone)}?text=${encodeURIComponent(`Oi ${user.name}, sua conta da cantina esta ${account.status === "overdue" ? "em atraso" : "em aberto"} no valor de ${formatCurrency(balance)}.`)}`;
    const card = document.createElement("article");
    card.className = "debtor-card";
    card.innerHTML = `<h3>${user.name}</h3><p>Telefone: ${formatPhone(user.phone)}</p><p>Referencia: ${formatMonthLabel(account.monthRef)}</p><p>Vencimento: ${formatDate(account.dueDate)}</p><p><strong>Saldo devedor: ${formatCurrency(balance)}</strong></p><div class="debtor-card__footer"><span class="badge ${badgeClass(account.status)}">${statusLabel(account.status)}</span><a class="btn btn--ghost link-button" href="${whatsappUrl}" target="_blank" rel="noreferrer">Cobrar no WhatsApp</a><button class="btn btn--primary" type="button" data-pay-account="${account.id}">Marcar como pago</button></div>`;
    card.querySelector("[data-pay-account]").addEventListener("click", () => settleAccount(account.id));
    elements.debtorsList.appendChild(card);
  });
}

function renderStockOverview() {
  const products = state.products.slice().sort((a, b) => a.stock - b.stock);
  elements.stockAdminList.innerHTML = "";

  if (!products.length) {
    elements.stockAdminList.appendChild(createEmptyState("Nenhum item cadastrado em estoque."));
    return;
  }

  products.forEach((product) => {
    const status = product.stock === 0 ? "Sem estoque" : product.stock <= 5 ? "Baixo" : "Ok";
    const card = document.createElement("article");
    card.className = "stock-card";
    card.innerHTML = `<strong>${product.name}</strong><p>${product.category}</p><p>${product.stock} unidades disponiveis</p><span class="badge ${product.stock === 0 ? "badge--danger" : product.stock <= 5 ? "badge--warning" : "badge--success"}">${status}</span>`;
    elements.stockAdminList.appendChild(card);
  });
}

function renderPendingPayments() {
  const pending = state.orders.filter((order) => order.paymentStatus === "pending");
  elements.pendingPaymentsList.innerHTML = "";

  if (!pending.length) {
    elements.pendingPaymentsList.appendChild(createEmptyState("Nenhum pagamento aguardando autenticacao."));
    return;
  }

  pending.forEach((order) => {
    const card = document.createElement("article");
    card.className = "payment-card";
    card.innerHTML = `<strong>${order.customerName} • ${paymentLabel(order.paymentMethod)}</strong><p>Total: ${formatCurrency(order.total)}</p><p>Pedido em validacao manual.</p><div class="form-actions"><button class="btn btn--primary" type="button" data-approve="${order.id}">Aprovar</button><button class="btn btn--danger" type="button" data-reject="${order.id}">Rejeitar</button></div>`;
    card.querySelector("[data-approve]").addEventListener("click", () => approvePayment(order.id));
    card.querySelector("[data-reject]").addEventListener("click", () => rejectPayment(order.id));
    elements.pendingPaymentsList.appendChild(card);
  });
}

function renderAdminOrders() {
  const orders = state.orders.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  elements.adminOrdersList.innerHTML = "";
  if (!orders.length) {
    elements.adminOrdersList.appendChild(createEmptyState("Nenhuma venda registrada."));
    return;
  }

  orders.forEach((order) => elements.adminOrdersList.appendChild(buildOrderCard(order)));
}

function renderFinanceChart() {
  const canvas = elements.financeChart;
  const ctx = canvas.getContext("2d");
  const width = canvas.width = canvas.clientWidth * window.devicePixelRatio;
  const height = canvas.height = 150 * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  ctx.clearRect(0, 0, width, height);

  const monthOrders = state.orders.filter((order) => isSameMonth(order.createdAt));
  const monthCash = state.cashClosings.filter((entry) => isSameMonth(entry.createdAt));
  const days = Array.from({ length: 7 }, (_, index) => index);
  const entries = days.map((offset) => dailyRevenue(offset, monthOrders));
  const exits = days.map((offset) => dailyExpenses(offset, monthCash));
  const max = Math.max(...entries, ...exits, 1);
  const baseY = 120;

  ctx.strokeStyle = "#d9c1b2";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, baseY);
  ctx.lineTo(24, 16);
  ctx.lineTo(320, 16);
  ctx.stroke();

  entries.forEach((value, index) => drawBar(ctx, 36 + index * 40, baseY, value, max, "#ca5b31"));
  exits.forEach((value, index) => drawBar(ctx, 54 + index * 40, baseY, value, max, "#a33832"));
}

function renderAdminProducts() {
  elements.adminProductList.innerHTML = "";
  if (!state.products.length) {
    elements.adminProductList.appendChild(createEmptyState("Cadastre o primeiro produto."));
    return;
  }

  state.products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-admin-card";
    card.innerHTML = `<img class="product-admin-card__image" src="${product.image || placeholderImage}" alt="${product.name}"><div><h3>${product.name}</h3><p>${product.category} • ${formatCurrency(product.price)} • ${product.stock} em estoque</p><p>${product.description}</p><div class="product-admin-card__footer"><button class="btn btn--ghost" type="button" data-edit-product="${product.id}">Editar</button><button class="btn btn--danger" type="button" data-delete-product="${product.id}">Excluir</button></div></div>`;
    card.querySelector("[data-edit-product]").addEventListener("click", () => fillProductForm(product.id));
    card.querySelector("[data-delete-product]").addEventListener("click", () => deleteProduct(product.id));
    elements.adminProductList.appendChild(card);
  });
}

function renderStockMoveOptions() {
  elements.stockMoveProduct.innerHTML = "";
  state.products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = `${product.name} (${product.stock})`;
    elements.stockMoveProduct.appendChild(option);
  });
}

function renderEmployeeLogs() {
  const logs = [
    ...state.cashClosings.map((entry) => ({ type: "Caixa", text: `${formatCurrency(entry.cashAmount)} em caixa e ${formatCurrency(entry.expense)} de saida`, createdAt: entry.createdAt })),
    ...state.stockMovements.map((entry) => ({ type: "Estoque", text: `${entry.productName}: ajuste ${entry.quantity > 0 ? "+" : ""}${entry.quantity} (${entry.note})`, createdAt: entry.createdAt }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  elements.employeeLogList.innerHTML = "";
  if (!logs.length) {
    elements.employeeLogList.appendChild(createEmptyState("Nenhum lancamento realizado ainda."));
    return;
  }

  logs.slice(0, 10).forEach((entry) => {
    const card = document.createElement("article");
    card.className = "order-card";
    card.innerHTML = `<div class="order-card__top"><div><h3>${entry.type}</h3><p class="order-card__meta">${formatDateTime(entry.createdAt)}</p></div></div><p class="order-card__items">${entry.text}</p>`;
    elements.employeeLogList.appendChild(card);
  });
}

function addToCart(productId) {
  const product = getProduct(productId);
  if (!product || product.stock === 0) {
    return;
  }
  const item = state.cart.find((entry) => entry.productId === productId);
  if ((item?.quantity ?? 0) >= product.stock) {
    alert("Nao ha mais unidades disponiveis.");
    return;
  }
  if (item) {
    item.quantity += 1;
  } else {
    state.cart.push({ productId, quantity: 1 });
  }
  renderApp();
}

function updateCartQuantity(productId, delta) {
  const item = state.cart.find((entry) => entry.productId === productId);
  const product = getProduct(productId);
  if (!item || !product) {
    return;
  }
  const nextQuantity = item.quantity + delta;
  if (nextQuantity <= 0) {
    state.cart = state.cart.filter((entry) => entry.productId !== productId);
  } else if (nextQuantity <= product.stock) {
    item.quantity = nextQuantity;
  }
  renderApp();
}

function clearCart() {
  state.cart = [];
  elements.orderNote.value = "";
  renderApp();
}

function finishOrder() {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== "customer") {
    return;
  }
  if (!state.cart.length) {
    alert("Adicione itens antes de finalizar.");
    return;
  }

  const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
  if (!paymentMethod || !isPaymentMethodAvailable(paymentMethod, currentUser)) {
    alert("Escolha um meio de pagamento disponivel.");
    return;
  }

  const requiresApproval = paymentMethod === "pix" || paymentMethod === "card_app" || paymentMethod === "card_store";
  const order = {
    id: crypto.randomUUID(),
    userId: currentUser.id,
    customerName: currentUser.name,
    items: state.cart.map((item) => {
      const product = getProduct(item.productId);
      product.stock -= item.quantity;
      return { productId: product.id, name: product.name, quantity: item.quantity, unitPrice: product.price };
    }),
    total: cartTotal(),
    paymentMethod,
    paymentStatus: paymentMethod === "monthly" ? "approved" : requiresApproval ? "pending" : "approved",
    status: paymentMethod === "monthly" ? "pending_monthly" : requiresApproval ? "awaiting_payment_confirmation" : "approved",
    note: elements.orderNote.value.trim(),
    createdAt: new Date().toISOString()
  };

  state.orders.unshift(order);
  if (paymentMethod === "monthly") {
    attachOrderToMonthlyAccount(order);
  }
  clearCart();
  renderApp();

  if (paymentMethod === "pix") {
    showPaymentAlert(`Pagamento Pix iniciado. Chave: ${state.settings.pixKey}. O pedido fica pendente ate autenticacao.`);
  } else if (paymentMethod === "card_app") {
    showPaymentAlert("Pagamento com cartao no app preparado para Mercado Pago. Nesta versao, o admin precisa autenticar manualmente.");
  } else if (paymentMethod === "card_store") {
    showPaymentAlert("Pagamento com cartao presencial registrado. Aguardando autenticacao manual.");
  }
}

function handleAdminOrderSubmit(event) {
  event.preventDefault();
  const customerName = elements.adminOrderCustomer.value.trim() || "Cliente balcão";
  const total = Number(elements.adminOrderTotal.value);
  const paymentMethod = elements.adminOrderPayment.value;
  const items = elements.adminOrderItems.value.trim();

  if (Number.isNaN(total) || total <= 0 || !items) {
    alert("Preencha total e itens do pedido manual.");
    return;
  }

  const order = {
    id: crypto.randomUUID(),
    userId: null,
    customerName,
    items: parseManualItems(items),
    total,
    paymentMethod,
    paymentStatus: paymentMethod === "monthly" ? "approved" : "pending",
    status: paymentMethod === "monthly" ? "pending_monthly" : "awaiting_payment_confirmation",
    note: elements.adminOrderNote.value.trim(),
    createdAt: new Date().toISOString()
  };

  state.orders.unshift(order);
  if (paymentMethod === "monthly") {
    attachOrderToMonthlyAccount(order);
  }
  elements.adminOrderForm.reset();
  renderApp();
}

function handleSettingsSubmit(event) {
  event.preventDefault();
  state.settings.pixKey = elements.adminPixKey.value.trim();
  state.settings.paymentMethods = {
    pix: elements.paymentPixEnabled.checked,
    card_app: elements.paymentCardEnabled.checked,
    card_store: true,
    monthly: elements.paymentMonthlyEnabled.checked
  };
  state.settings.paymentGateways.mercadoPago = elements.paymentCardEnabled.checked;
  renderApp();
}

function handleCashSubmit(event) {
  event.preventDefault();
  const cashAmount = Number(elements.cashAmount.value);
  const expense = Number(elements.cashExpense.value || 0);

  if (Number.isNaN(cashAmount) || cashAmount < 0 || Number.isNaN(expense) || expense < 0) {
    alert("Informe valores validos para o caixa.");
    return;
  }

  state.cashClosings.unshift({
    id: crypto.randomUUID(),
    cashAmount,
    expense,
    note: elements.cashNote.value.trim(),
    createdAt: new Date().toISOString()
  });

  elements.cashForm.reset();
  renderApp();
}

function handleStockMovementSubmit(event) {
  event.preventDefault();
  const product = getProduct(elements.stockMoveProduct.value);
  const quantity = Number(elements.stockMoveQuantity.value);
  if (!product || Number.isNaN(quantity) || quantity === 0) {
    alert("Informe produto e ajuste de estoque valido.");
    return;
  }

  product.stock = Math.max(product.stock + quantity, 0);
  state.stockMovements.unshift({
    id: crypto.randomUUID(),
    productId: product.id,
    productName: product.name,
    quantity,
    note: elements.stockMoveNote.value.trim() || "Sem observacao",
    createdAt: new Date().toISOString()
  });

  elements.stockMoveForm.reset();
  renderApp();
}

async function handleProductSubmit(event) {
  event.preventDefault();
  const name = elements.productName.value.trim();
  const category = elements.productCategory.value.trim();
  const description = elements.productDescription.value.trim();
  const price = Number(elements.productPrice.value);
  const stock = Number(elements.productStock.value);
  if (!name || !category || !description || Number.isNaN(price) || Number.isNaN(stock)) {
    alert("Preencha todos os campos do produto.");
    return;
  }
  const file = elements.productImageFile.files[0];
  let image = elements.productImageUrl.value.trim() || placeholderImage;
  if (file) {
    image = await fileToDataUrl(file);
  }

  if (elements.productId.value) {
    const product = getProduct(elements.productId.value);
    if (!product) {
      return;
    }
    product.name = name;
    product.category = category;
    product.description = description;
    product.price = price;
    product.stock = stock;
    product.image = image || product.image || placeholderImage;
  } else {
    state.products.unshift({ id: crypto.randomUUID(), name, category, description, price, stock, image });
  }

  resetProductForm();
  renderApp();
}

function approvePayment(orderId) {
  const order = state.orders.find((entry) => entry.id === orderId);
  if (!order) {
    return;
  }
  order.paymentStatus = "approved";
  order.status = order.paymentMethod === "monthly" ? "pending_monthly" : "approved";
  renderApp();
}

function rejectPayment(orderId) {
  const order = state.orders.find((entry) => entry.id === orderId);
  if (!order) {
    return;
  }
  order.paymentStatus = "rejected";
  order.status = "payment_rejected";
  renderApp();
}

function attachOrderToMonthlyAccount(order) {
  if (!order.userId) {
    return;
  }
  const ref = monthStart(new Date(order.createdAt));
  let account = state.monthlyAccounts.find((entry) => entry.userId === order.userId && entry.monthRef === ref);
  if (!account) {
    account = { id: crypto.randomUUID(), userId: order.userId, monthRef: ref, total: 0, paid: 0, dueDate: dueDateForMonth(0), status: "open", orderIds: [] };
    state.monthlyAccounts.push(account);
  }
  account.total += order.total;
  account.orderIds.push(order.id);
  account.status = withAccountStatus(account).status;
}

function settleAccount(accountId) {
  const account = state.monthlyAccounts.find((entry) => entry.id === accountId);
  if (!account) {
    return;
  }
  account.paid = account.total;
  account.status = "paid";
  state.orders.forEach((order) => {
    if (account.orderIds.includes(order.id)) {
      order.status = "approved";
      order.paymentStatus = "approved";
    }
  });
  renderApp();
}

function fillSettingsForm() {
  elements.adminPixKey.value = state.settings.pixKey || "";
  elements.paymentPixEnabled.checked = Boolean(state.settings.paymentMethods.pix);
  elements.paymentCardEnabled.checked = Boolean(state.settings.paymentMethods.card_app);
  elements.paymentMonthlyEnabled.checked = Boolean(state.settings.paymentMethods.monthly);
}

function fillProductForm(productId) {
  const product = getProduct(productId);
  if (!product) {
    return;
  }
  elements.productId.value = product.id;
  elements.productName.value = product.name;
  elements.productCategory.value = product.category;
  elements.productPrice.value = String(product.price);
  elements.productStock.value = String(product.stock);
  elements.productDescription.value = product.description;
  elements.productImageUrl.value = product.image;
  elements.productImageFile.value = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetProductForm() {
  elements.productForm.reset();
  elements.productId.value = "";
}

function deleteProduct(productId) {
  if (state.orders.some((order) => order.items.some((item) => item.productId === productId))) {
    alert("Esse produto ja aparece em pedidos e nao pode ser excluido.");
    return;
  }
  state.products = state.products.filter((product) => product.id !== productId);
  renderApp();
}

function buildOrderCard(order) {
  const fragment = templates.orderItem.content.cloneNode(true);
  const currentUser = getCurrentUser();
  const card = fragment.querySelector(".order-card");
  fragment.querySelector("h3").textContent = `${order.customerName} • ${paymentLabel(order.paymentMethod)}`;
  fragment.querySelector(".order-card__meta").textContent = formatDateTime(order.createdAt);
  fragment.querySelector(".order-card__total").textContent = formatCurrency(order.total);
  fragment.querySelector(".order-card__items").textContent = order.items.map((item) => `${item.quantity}x ${item.name}`).join(" • ");
  fragment.querySelector(".order-card__note").textContent = order.note || "Sem observacoes.";
  const badge = fragment.querySelector(".order-card__badge");
  badge.textContent = paymentStatusLabel(order.paymentStatus);
  badge.className = `badge order-card__badge ${paymentStatusBadge(order.paymentStatus)}`;
  if (currentUser?.role === "admin" && order.paymentStatus === "pending") {
    const actions = document.createElement("div");
    actions.className = "form-actions";
    actions.innerHTML = `<button class="btn btn--primary" type="button" data-approve="${order.id}">Aprovar</button><button class="btn btn--danger" type="button" data-reject="${order.id}">Rejeitar</button>`;
    actions.querySelector("[data-approve]").addEventListener("click", () => approvePayment(order.id));
    actions.querySelector("[data-reject]").addEventListener("click", () => rejectPayment(order.id));
    card.appendChild(actions);
  }
  return fragment;
}

function parseManualItems(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean).map((item) => ({ productId: null, name: item, quantity: 1, unitPrice: 0 }));
}

function isPaymentMethodAvailable(paymentMethod, user) {
  if (paymentMethod === "monthly") {
    return state.settings.paymentMethods.monthly && user.monthlyEnabled;
  }
  return Boolean(state.settings.paymentMethods[paymentMethod]);
}

function showPaymentAlert(message) {
  alert(message);
}

function isRevenueOrder(order) {
  return order.paymentStatus === "approved" && order.paymentMethod !== "monthly";
}

function monthExpenses() {
  return state.cashClosings.filter((entry) => isSameMonth(entry.createdAt)).reduce((sum, entry) => sum + entry.expense, 0);
}

function isSameMonth(value) {
  const date = new Date(value);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function dailyRevenue(offset, monthOrders) {
  const date = new Date();
  date.setDate(date.getDate() - (6 - offset));
  return monthOrders.filter((order) => new Date(order.createdAt).toDateString() === date.toDateString() && order.paymentStatus === "approved").reduce((sum, order) => sum + order.total, 0);
}

function dailyExpenses(offset, cashClosings) {
  const date = new Date();
  date.setDate(date.getDate() - (6 - offset));
  return cashClosings.filter((entry) => new Date(entry.createdAt).toDateString() === date.toDateString()).reduce((sum, entry) => sum + entry.expense, 0);
}

function drawBar(ctx, x, baseY, value, max, color) {
  const height = (value / max) * 84;
  ctx.fillStyle = color;
  ctx.fillRect(x, baseY - height, 14, height);
}

function getCurrentUser() {
  return state.users.find((user) => user.id === state.sessionUserId) ?? null;
}

function getUser(id) {
  return state.users.find((user) => user.id === id);
}

function getProduct(id) {
  return state.products.find((product) => product.id === id);
}

function cartTotal() {
  return state.cart.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

function withAccountStatus(account) {
  if (account.paid >= account.total) {
    return { ...account, status: "paid" };
  }
  return { ...account, status: new Date(account.dueDate) < new Date() ? "overdue" : "open" };
}

function paymentLabel(value) {
  return {
    pix: "Pix",
    card_app: "Cartao no app",
    card_store: "Cartao presencial",
    monthly: "Conta mensal"
  }[value] ?? "Pagamento";
}

function paymentStatusLabel(value) {
  return {
    pending: "Aguardando autenticacao",
    approved: "Aprovado",
    rejected: "Rejeitado"
  }[value] ?? "Pendente";
}

function paymentStatusBadge(value) {
  return value === "approved" ? "badge--success" : value === "rejected" ? "badge--danger" : "badge--warning";
}

function statusLabel(value) {
  return { paid: "Pago", open: "Em aberto", overdue: "Em atraso" }[value] ?? value;
}

function badgeClass(status) {
  return status === "paid" ? "badge--success" : status === "overdue" ? "badge--danger" : "badge--warning";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value));
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function formatMonthLabel(value) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(value));
}

function sanitizePhone(value) {
  return value.replace(/\D/g, "");
}

function formatPhone(value) {
  const digits = sanitizePhone(value);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return digits;
}

function setStatus(message) {
  elements.authMessage.textContent = message;
}

function createEmptyState(message) {
  const element = document.createElement("div");
  element.className = "empty-state";
  element.textContent = message;
  return element;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Falha ao ler imagem."));
    reader.readAsDataURL(file);
  });
}

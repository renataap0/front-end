const { execute, inClause, rows } = require("./helpers");
const { mapOrder, mapOrderItem, mapProduct, mapUser } = require("./mappers");

const orderColumns = `
  o.id,
  CONCAT('RA-', LPAD(o.id, 6, '0')) AS code,
  o.usuario_id AS userId,
  u.nome_usuario AS customerName,
  '' AS customerEmail,
  '' AS customerZip,
  'site' AS paymentMethod,
  o.valor_total AS subtotal,
  o.valor_frete AS shipping,
  (o.valor_total + o.valor_frete) AS total,
  'aprovado' AS status,
  o.criado_em AS createdAt,
  NULL AS updatedAt
`;

const userJoinColumns = `
  u.id AS user_id,
  u.nome_usuario AS user_username,
  u.perfil AS user_role,
  p.equipe_id AS user_teamId,
  p.id AS user_driverId,
  u.criado_em AS user_createdAt,
  NULL AS user_updatedAt
`;

function attachOrderUser(row) {
  const order = mapOrder(row);

  if (!order) {
    return null;
  }

  order.user = mapUser(row, "user_");
  return order;
}

async function attachItems(orders, connection = null) {
  if (!orders.length) {
    return orders;
  }

  const orderIds = orders.map((order) => order.id);
  const itemRows = await rows(
    `
      SELECT
        oi.id,
        oi.pedido_id AS orderId,
        oi.produto_id AS productId,
        oi.quantidade AS quantity,
        oi.preco_unitario AS unitPrice,
        (oi.quantidade * oi.preco_unitario) AS total,
        p.id AS product_id,
        p.nome AS product_name,
        NULL AS product_description,
        p.preco AS product_price,
        999 AS product_stock,
        NULL AS product_imageUrl,
        1 AS product_active,
        NULL AS product_createdAt,
        NULL AS product_updatedAt
      FROM itens_pedido oi
      INNER JOIN produtos p ON p.id = oi.produto_id
      WHERE oi.pedido_id IN (${inClause(orderIds)})
      ORDER BY oi.id ASC
    `,
    orderIds,
    connection
  );

  const itemsByOrder = new Map();

  itemRows.forEach((row) => {
    const item = mapOrderItem(row);
    item.product = mapProduct(row, "product_");

    if (!itemsByOrder.has(item.orderId)) {
      itemsByOrder.set(item.orderId, []);
    }

    itemsByOrder.get(item.orderId).push(item);
  });

  return orders.map((order) => ({
    ...order,
    items: itemsByOrder.get(order.id) || []
  }));
}

function whereForUser(user) {
  return user.role === "admin" ? { sql: "", params: [] } : { sql: "WHERE o.usuario_id = ?", params: [user.id] };
}

async function listOrders(user) {
  const filter = whereForUser(user);
  const result = await rows(
    `
      SELECT ${orderColumns}, ${userJoinColumns}
      FROM pedidos o
      INNER JOIN usuarios u ON u.id = o.usuario_id
      LEFT JOIN pilotos p ON p.usuario_id = u.id
      ${filter.sql}
      ORDER BY o.criado_em DESC
    `,
    filter.params
  );

  return attachItems(result.map((row) => attachOrderUser(row)));
}

async function findOrderById(id, user = null, connection = null) {
  const filter = user && user.role !== "admin" ? "AND o.usuario_id = ?" : "";
  const params = user && user.role !== "admin" ? [id, user.id] : [id];

  const result = await rows(
    `
      SELECT ${orderColumns}, ${userJoinColumns}
      FROM pedidos o
      INNER JOIN usuarios u ON u.id = o.usuario_id
      LEFT JOIN pilotos p ON p.usuario_id = u.id
      WHERE o.id = ? ${filter}
    `,
    params,
    connection
  );

  const orders = await attachItems(result.map((row) => attachOrderUser(row)), connection);
  return orders[0] || null;
}

async function createOrder(data, items, connection) {
  const orderResult = await execute(
    `
      INSERT INTO pedidos (usuario_id, valor_total, valor_frete)
      VALUES (?, ?, ?)
    `,
    [
      data.userId,
      data.subtotal,
      data.shipping
    ],
    connection
  );

  for (const item of items) {
    await execute(
      `
        INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
        VALUES (?, ?, ?, ?)
      `,
      [orderResult.insertId, item.product.id, item.quantity, item.unitPrice],
      connection
    );
  }

  return findOrderById(orderResult.insertId, null, connection);
}

async function countOrders() {
  const result = await rows("SELECT COUNT(*) AS total FROM pedidos");
  return result[0].total;
}

async function sumRevenue() {
  const result = await rows("SELECT COALESCE(SUM(valor_total + valor_frete), 0) AS total FROM pedidos");
  return Number(result[0].total);
}

module.exports = { countOrders, createOrder, findOrderById, listOrders, sumRevenue };

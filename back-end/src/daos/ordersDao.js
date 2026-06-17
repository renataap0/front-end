const { execute, inClause, rows } = require("./helpers");
const { mapOrder, mapOrderItem, mapProduct, mapUser } = require("./mappers");

const orderColumns = `
  o.id,
  o.code,
  o.user_id AS userId,
  o.customer_name AS customerName,
  o.customer_email AS customerEmail,
  o.customer_zip AS customerZip,
  o.payment_method AS paymentMethod,
  o.subtotal,
  o.shipping,
  o.total,
  o.status,
  o.created_at AS createdAt,
  o.updated_at AS updatedAt
`;

const userJoinColumns = `
  u.id AS user_id,
  u.username AS user_username,
  u.role AS user_role,
  u.team_id AS user_teamId,
  u.driver_id AS user_driverId,
  u.created_at AS user_createdAt,
  u.updated_at AS user_updatedAt
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
        oi.order_id AS orderId,
        oi.product_id AS productId,
        oi.quantity,
        oi.unit_price AS unitPrice,
        oi.total,
        p.id AS product_id,
        p.name AS product_name,
        p.description AS product_description,
        p.price AS product_price,
        p.stock AS product_stock,
        p.image_url AS product_imageUrl,
        p.active AS product_active,
        p.created_at AS product_createdAt,
        p.updated_at AS product_updatedAt
      FROM order_items oi
      INNER JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id IN (${inClause(orderIds)})
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
  return user.role === "admin" ? { sql: "", params: [] } : { sql: "WHERE o.user_id = ?", params: [user.id] };
}

async function listOrders(user) {
  const filter = whereForUser(user);
  const result = await rows(
    `
      SELECT ${orderColumns}, ${userJoinColumns}
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      ${filter.sql}
      ORDER BY o.created_at DESC
    `,
    filter.params
  );

  return attachItems(result.map((row) => attachOrderUser(row)));
}

async function findOrderById(id, user = null, connection = null) {
  const filter = user && user.role !== "admin" ? "AND o.user_id = ?" : "";
  const params = user && user.role !== "admin" ? [id, user.id] : [id];

  const result = await rows(
    `
      SELECT ${orderColumns}, ${userJoinColumns}
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
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
      INSERT INTO orders
        (code, user_id, customer_name, customer_email, customer_zip, payment_method, subtotal, shipping, total, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.code,
      data.userId,
      data.customerName,
      data.customerEmail,
      data.customerZip,
      data.paymentMethod,
      data.subtotal,
      data.shipping,
      data.total,
      data.status || "aprovado"
    ],
    connection
  );

  for (const item of items) {
    await execute(
      `
        INSERT INTO order_items (order_id, product_id, quantity, unit_price, total)
        VALUES (?, ?, ?, ?, ?)
      `,
      [orderResult.insertId, item.product.id, item.quantity, item.unitPrice, item.total],
      connection
    );
  }

  return findOrderById(orderResult.insertId, null, connection);
}

async function countOrders() {
  const result = await rows("SELECT COUNT(*) AS total FROM orders");
  return result[0].total;
}

async function sumRevenue() {
  const result = await rows("SELECT COALESCE(SUM(total), 0) AS total FROM orders");
  return Number(result[0].total);
}

module.exports = { countOrders, createOrder, findOrderById, listOrders, sumRevenue };

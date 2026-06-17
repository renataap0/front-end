const { transaction } = require("../config/database");
const ordersDao = require("../daos/ordersDao");
const productsDao = require("../daos/productsDao");
const { AppError } = require("../utils/AppError");
const { serializeOrder } = require("../utils/serializers");

function orderWhereForUser(user) {
  return user.role === "admin" ? {} : { userId: user.id };
}

async function listOrders(user) {
  const orders = await ordersDao.listOrders(user);
  return orders.map(serializeOrder);
}

async function getOrder(id, user) {
  const order = await ordersDao.findOrderById(id, user);

  if (!order) {
    throw new AppError("Pedido nao encontrado.", 404);
  }

  return serializeOrder(order);
}

async function createOrder(data, user) {
  const requestedQuantities = new Map();

  data.items.forEach((item) => {
    requestedQuantities.set(item.productId, (requestedQuantities.get(item.productId) || 0) + item.quantity);
  });

  const productIds = Array.from(requestedQuantities.keys());

  return transaction(async (connection) => {
    const products = await productsDao.listActiveProductsByIds(productIds, connection);

    if (products.length !== productIds.length) {
      throw new AppError("Um ou mais produtos nao foram encontrados.", 404);
    }

    const items = products.map((product) => {
      const quantity = requestedQuantities.get(product.id) || 0;

      if (product.stock < quantity) {
        throw new AppError(`Estoque insuficiente para ${product.name}.`, 409);
      }

      const unitPrice = Number(product.price);
      const total = unitPrice * quantity;

      return { product, quantity, unitPrice, total };
    });

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const shipping = subtotal >= 500 ? 0 : 24.9;
    const total = subtotal + shipping;

    for (const item of items) {
      await productsDao.decrementStock(item.product.id, item.quantity, connection);
    }

    const order = await ordersDao.createOrder(
      {
        code: `RA-${Date.now().toString().slice(-8)}`,
        userId: user.id,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerZip: data.customerZip,
        paymentMethod: data.paymentMethod,
        subtotal,
        shipping,
        total
      },
      items,
      connection
    );

    return serializeOrder(order);
  });
}

module.exports = { createOrder, getOrder, listOrders, orderWhereForUser };

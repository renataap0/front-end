function decimalToNumber(value) {
  if (value === null || value === undefined) {
    return value;
  }

  return typeof value === "number" ? value : Number(value);
}

function serializeProduct(product) {
  if (!product) {
    return product;
  }

  return {
    ...product,
    price: decimalToNumber(product.price),
    active: Boolean(product.active)
  };
}

function serializeOrder(order) {
  if (!order) {
    return order;
  }

  return {
    ...order,
    subtotal: decimalToNumber(order.subtotal),
    shipping: decimalToNumber(order.shipping),
    total: decimalToNumber(order.total),
    items: order.items?.map((item) => ({
      ...item,
      unitPrice: decimalToNumber(item.unitPrice),
      total: decimalToNumber(item.total),
      product: serializeProduct(item.product)
    }))
  };
}

module.exports = { decimalToNumber, serializeOrder, serializeProduct };

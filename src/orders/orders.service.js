const knex = require("../db/connection");

const list = () => {
  return knex("orders")
    .select("*")
    .then((orders) => {
      const formattedOrders = orders.map((order) => {
        return knex("orders_dishes as od")
          .join("dishes", "dishes.dish_id", "od.dish_id")
          .select("dishes.*", "od.quantity")
          .where({ order_id: order.order_id })
          .then((dishes) => {
            return {
              ...order,
              dishes,
            };
          });
      });

      return Promise.all(formattedOrders);
    });
};

const read = (orderId) => {
  return knex("orders")
    .select("*")
    .where({ order_id: orderId })
    .first()
    .then((order) => {
      return knex("orders_dishes as od")
        .join("dishes", "dishes.dish_id", "od.dish_id")
        .select("dishes.*", "od.quantity")
        .where({ order_id: order.order_id })
        .then((dishes) => {
          return {
            ...order,
            dishes,
          };
        });
    });
};

module.exports = {
  list,
  read,
};

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

module.exports = {
  list,
};

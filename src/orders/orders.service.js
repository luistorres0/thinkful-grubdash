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

const create = (newOrder) => {
  const orderOnlyValues = {
    deliverTo: newOrder.deliverTo,
    mobileNumber: newOrder.mobileNumber,
    status: newOrder.status,
  };

  return knex("orders")
    .insert(orderOnlyValues, "*")
    .then((orders) => {
      const formattedDishes = newOrder.dishes.map((dish) => ({
        dish_id: dish.dish_id,
        order_id: orders[0].order_id,
        quantity: dish.quantity,
      }));
      return knex("orders_dishes")
        .insert(formattedDishes, "*")
        .then(() => read(orders[0].order_id));
    });
};

const update = (updatedOrder) => {
  const orderOnlyValues = {
    deliverTo: updatedOrder.deliverTo,
    mobileNumber: updatedOrder.mobileNumber,
    status: updatedOrder.status,
  };

  return knex("orders")
    .update(orderOnlyValues, "*")
    .where({ order_id: updatedOrder.order_id })
    .then((orders) => {
      return knex("orders_dishes")
        .del()
        .where({ order_id: orders[0].order_id })
        .then(() => {
          const formattedDishes = updatedOrder.dishes.map((dish) => ({
            dish_id: dish.dish_id,
            order_id: orders[0].order_id,
            quantity: dish.quantity,
          }));
          return knex("orders_dishes")
            .insert(formattedDishes, "*")
            .then(() => read(orders[0].order_id));
        });
    });
};

const destroy = (orderId) => {
  return knex("orders").del().where({ order_id: orderId });
};

module.exports = {
  list,
  read,
  create,
  update,
  destroy,
};

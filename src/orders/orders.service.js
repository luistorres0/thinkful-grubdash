const knex = require("../db/connection");

const list = () => {
  return knex("orders as o")
    .join("orders_dishes as od", "o.id", "od.order_id")
    .join("dishes as d", "d.id", "od.dish_id")
    .select("*")
    .then(rows => {
        console.log(rows);
        return rows;
    });
};

module.exports = {
  list,
};

const knex = require("../db/connection");

const list = () => {
  return knex("dishes").select("*");
};

const read = (dishId) => {
  return knex("dishes").select("*").where({ id: dishId }).first();
};

const create = (newDish) => {
  return knex("dishes")
    .insert(newDish, "*")
    .then((dishes) => dishes[0]);
};

module.exports = {
  list,
  read,
  create,
};

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

const update = (updatedDish, dishId) => {
  return knex("dishes")
    .update(updatedDish, "*")
    .where({ id: dishId })
    .then((dishes) => dishes[0]);
};

module.exports = {
  list,
  read,
  create,
  update,
};

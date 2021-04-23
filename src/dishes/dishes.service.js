const knex = require("../db/connection");

const list = () => {
  return knex("dishes").select("*");
};

const read = (dishId) => {
  return knex("dishes").select("*").where({ id: dishId }).first();
};

module.exports = {
  list,
  read,
};

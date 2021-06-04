const knex = require("../db/connection");

const list = () => {
  return knex("orders").select("*");
};

module.exports = {
  list,
};

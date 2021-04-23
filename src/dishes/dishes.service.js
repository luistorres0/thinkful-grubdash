const knex = require("../db/connection");

const list = () => {
  return knex("dishes").select("*");
};

module.exports = {
  list,
};

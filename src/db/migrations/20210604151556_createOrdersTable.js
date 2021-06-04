exports.up = function (knex) {
  return knex.schema.createTable("orders", (table) => {
    table.increments("id").primary();
    table.string("deliverTo");
    table.string("mobileNumber");
    table.string("status");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("orders");
};

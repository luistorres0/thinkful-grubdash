exports.up = function (knex) {
  return knex.schema.createTable("orders", (table) => {
    table.increments("id").primary();
    table.string("deliverTo");
    table.string("mobileNumber");
    table.string("status");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("orders");
};

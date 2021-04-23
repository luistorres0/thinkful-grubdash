const { PORT = 5000 } = process.env;
const knex = require("./db/connection");
const path = require("path");
const app = require(path.resolve(`${process.env.SOLUTION_PATH || ""}`, "src/app"));

const listener = () => console.log(`Listening on Port ${PORT}!`);

knex.migrate
  .latest()
  .then((migrations) => {
    console.log("migrations", migrations);
    app.listen(PORT, listener);
  })
  .catch(console.error);

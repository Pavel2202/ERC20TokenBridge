const express = require("express");
const bodyParser = require("body-parser");
const databaseConfig = require("./config/database");
const routesConfig = require("./config/routes");
const cors = require("cors");
const listener = require("./controllers/listener");

start();

async function start() {
  const app = express();

  //app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cors());
  await databaseConfig(app);
  routesConfig(app);
  await listener();

  app.listen(3001, () => console.log("Server running on port 3001"));
}

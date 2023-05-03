const transferController = require("../controllers/transfer");

module.exports = (app) => {
  app.use(transferController);
};

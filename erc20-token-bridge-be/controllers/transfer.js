const router = require("express").Router();
const Transfer = require("../models/Transfer");

router.get("/transfers", async (req, res) => {
  const result = await Transfer.find({});
  res.json(result);
});

module.exports = router;

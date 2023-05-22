const router = require("express").Router();
const Transfer = require("../models/Transfer");

router.get("/transfers", async (req, res) => {
  const result = await Transfer.find({});
  res.json(result);
});

router.put("/transfers/:id", async (req, res) => {
  const id = req.params.id;
  const transfer = await Transfer.findById(id);
  transfer.isClaimed = true;
  await transfer.save();
  return transfer;
})

module.exports = router;

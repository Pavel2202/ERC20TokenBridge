const router = require("express").Router();
const Transfer = require("../models/Transfer");

router.get("/transfers", async (req, res) => {
  const perPage = 1;
  const page = req.query.page == "undefined" ? 1 : req.query.page;
  const startFrom = (page - 1) * perPage;
  const chainName = req.query.chainName;
  const account = req.query.account;

  const result = await Transfer.find({ to: new RegExp('\\b' + account + '\\b', 'i') })
    .find({ toBridge: chainName })
    .sort([["_id", -1]])
    .skip(startFrom)
    .limit(perPage);

  res.json(result);
});

router.put("/transfers/:id", async (req, res) => {
  const id = req.params.id;
  const transfer = await Transfer.findById(id);
  transfer.isClaimed = true;
  await transfer.save();
  return transfer;
});

module.exports = router;

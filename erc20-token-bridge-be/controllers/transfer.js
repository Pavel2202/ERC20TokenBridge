const router = require("express").Router();
const Transfer = require("../models/Transfer");

const perPage = 10;

router.get("/pages", async (req, res) => {
  const chainId = req.query.chainId;
  const account = req.query.account;

  const result = await Transfer.find({
    to: new RegExp("\\b" + account + "\\b", "i"),
  })
    .find({ toBridgeChainId: chainId })
    .find({ isClaimed: req.query.claimed })
    .sort([["_id", -1]]);

  res.json(Math.ceil(result.length / perPage));
});

router.get("/transfers", async (req, res) => {
  const page = req.query.page == "undefined" ? 1 : req.query.page;
  const startFrom = (page - 1) * perPage;
  const chainId = req.query.chainId;

  const account = req.query.account;
  const result = await Transfer.find({
    to: new RegExp("\\b" + account + "\\b", "i"),
  })
    .find({ toBridgeChainId: chainId })
    .find({ isClaimed: req.query.claimed })
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
  res.json(transfer);
});

module.exports = router;

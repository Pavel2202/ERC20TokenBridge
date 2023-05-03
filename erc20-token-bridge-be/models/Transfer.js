const { Schema, model } = require("mongoose");

const transferSchema = new Schema({
  from: { type: String },
  to: { type: String },
  token: { type: String },
  targetBridge: { type: String },
  amount: { type: Number },
  isClaimed: { type: Boolean },
});

const Transfer = model("Transfer", transferSchema);

module.exports = Transfer;

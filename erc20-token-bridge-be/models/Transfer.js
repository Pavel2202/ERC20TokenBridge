const { Schema, model } = require("mongoose");

const transferSchema = new Schema({
  from: { type: String },
  to: { type: String },
  token: { type: String },
  wrappedToken: { type: String },
  fromBridgeChainId: { type: String },
  fromBridge: { type: String },
  toBridgeChainId: { type: String },
  toBridge: { type: String },
  amount: { type: String },
  isClaimed: { type: Boolean },
});

const Transfer = model("Transfer", transferSchema);

module.exports = Transfer;

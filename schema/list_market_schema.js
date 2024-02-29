const mongoose = require("mongoose");

//Schema
const ListMarketSchema = new mongoose.Schema(
  {
    market_id: {
      type: String,
    },
    market_name: {
      type: String,
    },
    market_start_time: {
      type: String,
    },
    total_matched: {
      type: String,
    },
    runners: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("list-market", ListMarketSchema);

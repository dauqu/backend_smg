const mongoose = require("mongoose");

//Schema
const ListMarketSchema = new mongoose.Schema(
  {
    event_id: {
      type: String,
    },
    market_id: {
      type: String,
    },
    market: {
      type: String,
    },
    update_time: {
      type: String,
    },
    status: {
      type: String,
    },
    inplay: {
      type: Boolean,
    },
    total_matched: {
      type: String,
    },
    active: {
      type: Boolean,
    },
    market_type: {
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

module.exports = mongoose.model("market-odds", ListMarketSchema);

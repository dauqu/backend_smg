const mongoose = require("mongoose");

//Schema
const EventSchema = new mongoose.Schema(
  {
    event_id: {
      type: String,
    },
    event_name: {
      type: String,
    },
    competition_id: {
      type: String,
    },
    country_code: {
      type: String,
    },
    timezone: {
      type: String,
    },
    open_date: {
      type: String,
    },
    market_count: {
      type: String,
    },
    scoreboard_id: {
      type: String,
    },
    selections: {
      type: String,
    },
    liability_type: {
      type: String,
    },
    undeclared_market: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("event", EventSchema);

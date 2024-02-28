const mongoose = require("mongoose");

//Schema
const EventSchema = new mongoose.Schema(
  {
    event_type: {
      type: String,
    },
    event_name: {
      type: String,
    },
    market_count: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("events", EventSchema);

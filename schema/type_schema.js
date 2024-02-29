const mongoose = require("mongoose");

//Schema
const TypeSchema = new mongoose.Schema(
  {
    event_type: {
      type: String,
    },
    type_name: {
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

module.exports = mongoose.model("type", TypeSchema);

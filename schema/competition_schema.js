const mongoose = require("mongoose");

//Schema
const CompetitionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    name: {
      type: String,
    },
    event_id: {
      type: String,
    },
    market_count: {
      type: String,
    },
    competition_region: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("competition", CompetitionSchema);

const mongoose = require("mongoose");

//Schema
const GameSchema = new mongoose.Schema(
  {
    team_one_id: {
      type: String,
    },
    team_two_id: {
      type: String,
    },
    league_id: {
      type: String,
    },
    slug: {
      type: String,
    },
    start_time: {
      type: String,
    },
    bet_start_time: {
      type: Date,
      default: Date.now,
    },
    bet_end_time: {
      type: String,
      //Any future of 2025
      default: "2025-01-01T00:00:00.000Z",
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("game", GameSchema);

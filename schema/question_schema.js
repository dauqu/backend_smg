const mongoose = require("mongoose");

//Schema
const QuestionSchema = new mongoose.Schema(
  {
    game_id: {
      type: String,
    },
    title: {
      type: String,
    },
    status: {
      type: String,
    },
    locked: {
      type: String,
    },
    result: {
      type: String,
    },
    refund: {
      type: String,
    },
    win_option_id: {
      type: String,
    },
    amount_refunded: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("questions", QuestionSchema);

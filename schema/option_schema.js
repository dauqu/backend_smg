const mongoose = require("mongoose");

//Schema
const OptionSchema = new mongoose.Schema(
  {
    question_id: {
      type: String,
    },
    type: {
      type: String,
    },
    name: {
      type: String,
    },
    odds: {
      type: String,
    },
    status: {
      type: String,
    },
    locked: {
      type: String,
    },
    winner: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("option", OptionSchema);

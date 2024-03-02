const mongoose = require("mongoose");

//Schema
const BetSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    bet_amount: {
      type: Number,
      required: true,
    },
    bet_type: {
      type: String,
      required: true,
      enum: ["single", "multi"],
    },
    bet_number: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "won", "lost"],
      default: "pending",
    },
    result_time: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("bet", BetSchema);

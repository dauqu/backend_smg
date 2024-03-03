const mongoose = require("mongoose");

//Schema
const BetSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    event_name: {
      type: String,
      required: true,
    },
    bet_amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["back", "lay"],
    },
    stack: {
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

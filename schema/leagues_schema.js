const mongoose = require("mongoose");

//Schema
const LeaguesSchema = new mongoose.Schema(
  {
    category_id: {
      type: String,
    },
    name: {
      type: String,
    },
    short_name: {
      type: String,
    },
    slug: {
      type: String,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("leagues", LeaguesSchema);

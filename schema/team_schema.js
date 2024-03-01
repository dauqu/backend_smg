const mongoose = require("mongoose");

//Schema
const TeamSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    category_id: {
      type: String,
    },
    slug: {
      type: String,
    },
    name: {
      type: String,
    },
    short_name: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("team", TeamSchema);

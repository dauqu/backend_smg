const mongoose = require("mongoose");

//Schema
const UsersSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: null,
    },
    username: {
      type: String,
      required: null,
    },
    email: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "en",
    },
    country_name: {
      type: String,
      default: "India",
    },
    code: {
      type: String,
      default: "IN",
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("users", UsersSchema);

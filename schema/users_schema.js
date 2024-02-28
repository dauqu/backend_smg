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
      required: true,
    },
    email: {
      type: String,
      required: false,
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
    gender: {
      type: String,
      default: "male",
    },
    age: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: "delhi",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("users", UsersSchema);

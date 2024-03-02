const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const UsersSchema = require("./../schema/users_schema");
const SendMail = require("./../functions/send_mail");

router.get("/", (req, res) => {
  res.json({
    message: "Welcome to the register route",
  });
});

router.post("/", validateRegister, async (req, res) => {
  //Hash password
  const hashed_password = await bcrypt.hash(req.body.password, 10);

  const uuid = uuidv4();

  //Save user to database
  const save_user = new UsersSchema({
    full_name: req.body.full_name,
    dp: "https://styles.redditmedia.com/t5_2c83sr/styles/profileIcon_4dwzf4syg0w51.png",
    email: req.body.email,
    password: hashed_password,
    rpt: uuid,
  });
  try {
    await save_user.save();

    const html = `<h1>Verify your email</h1><p>Click <a href="https://dauqunews.vercel.app/verify/${uuid}">here</a> to verify your email</p>`;
    SendMail(req.body.email, uuid, req.body.full_name, html);
    res.status(200).json({
      message: "User created successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message, status: "error" });
  }
});

//Middleware for register validation
async function validateRegister(req, res, next) {
  const { full_name, email, password } = req.body;

  //Check if all fields are filled
  if (
    full_name === "" ||
    email === "" ||
    password === "" ||
    full_name === undefined ||
    email === undefined ||
    password === undefined ||
    email === null ||
    password === null
  ) {
    return res
      .status(400)
      .json({ message: "All fields are required", status: "error" });
  }

  //Check password length
  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
      status: "error",
    });
  }

  //Check if user exists
  const user = await UsersSchema.findOne({ email: req.body.email });
  if (user)
    return res.status(400).json({
      message: "Email already exists",
      status: "error",
    });

  //Check email is valid
  const email_regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!email_regex.test(email))
    return res.status(400).json({
      message: "Email is not valid",
      status: "error",
    });

  //Check Username is valid
  // const username_regex = /^[a-zA-Z0-9]+$/;
  // if (!username_regex.test(username))
  //   return res.status(400).json({
  //     message: "Username is not valid",
  //     status: "error",
  //   });

  //Check username is unique
  // const user_exists = await UsersSchema.findOne({ username: username });
  // if (user_exists)
  //   return res.status(400).json({
  //     message: "Username is already taken",
  //     status: "error",
  //   });

  //Check phone is valid
  // const phone_regex = /^[0-9]{10}$/;
  // if (!phone_regex.test(phone))
  //   return res.status(400).json({
  //     message: "Phone is not valid",
  //     status: "error",
  //   });

  //Check phone is unique
  // const phone_exists = await UsersSchema.findOne({ phone: phone });
  // if (phone_exists)
  //   return res.status(400).json({
  //     message: "Phone is already exists",
  //     status: "error",
  //   });

  next();
}

module.exports = router;

const express = require("express");
const router = express.Router();
const UsersSchema = require("./../schema/users_schema");
const bcrypt = require("bcryptjs");
const CheckAuth = require("./../functions/check_auth");

router.get("/", (req, res) => {
  res.json({
    message: "Welcome to the API",
  });
});

router.get("/by-id/:id", async (req, res) => {
  try {
    const user = await UsersSchema.findOne({
      _id: req.params.id,
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", validateRegister, async (req, res) => {
  //Hash password
  const hashed_password = await bcrypt.hash(req.body.password, 10);

  //Save user to database
  const save_user = new UsersSchema({
    full_name: req.body.full_name,
    dp: "https://styles.redditmedia.com/t5_2c83sr/styles/profileIcon_4dwzf4syg0w51.png",
    title: "I am new here :)",
    about: "Edit your profile to add more information about yourself",
    phone: req.body.phone,
    email: req.body.email,
    username: req.body.username,
    password: hashed_password,
    language: "english",
    country: "india",
  });
  try {
    await save_user.save();
    res.status(200).json({
      message: "User created successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message, status: "error" });
  }
});

//Middleware for register validation
async function validateRegister(req, res, next) {
  const { full_name, phone, email, username, password } = req.body;

  //Check if all fields are filled
  if (
    full_name === "" ||
    phone === "" ||
    email === "" ||
    username === "" ||
    password === "" ||
    full_name === undefined ||
    phone === undefined ||
    email === undefined ||
    username === undefined ||
    password === undefined ||
    full_name === null ||
    phone === null ||
    email === null ||
    username === null ||
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
  const username_regex = /^[a-zA-Z0-9]+$/;
  if (!username_regex.test(username))
    return res.status(400).json({
      message: "Username is not valid",
      status: "error",
    });

  //Check username is unique
  const user_exists = await UsersSchema.findOne({ username: username });
  if (user_exists)
    return res.status(400).json({
      message: "Username is already taken",
      status: "error",
    });

  //Check phone is valid
  const phone_regex = /^[0-9]{10}$/;
  if (!phone_regex.test(phone))
    return res.status(400).json({
      message: "Phone is not valid",
      status: "error",
    });

  //Check phone is unique
  const phone_exists = await UsersSchema.findOne({ phone: phone });
  if (phone_exists)
    return res.status(400).json({
      message: "Phone is already exists",
      status: "error",
    });

  next();
}

//Get all users
router.get("/all", async (req, res) => {
  try {
    const users = await UsersSchema.find().lean();
    //
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Get all users
router.get("/feed", async (req, res) => {
  //Check Auth
  const auth = await CheckAuth(req, res);
  if (!auth) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    //Get all users and remove mine from the list
    const users = await UsersSchema.find({ _id: { $ne: auth.data._id } }).select("_id full_name dp title location");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Get users by recent date 
router.get("/recent", async (req, res) => {
    try {
        const users = await UsersSchema.find().sort({createdAt: -1}).limit(10).select("full_name dp title location").lean();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Delete user
router.delete("/:id", async (req, res) => {
  try {
    const user = await UsersSchema.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

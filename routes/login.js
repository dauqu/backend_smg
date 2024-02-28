const express = require("express");
const router = express.Router();
const UsersSchema = require("./../schema/users_schema");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const CheckAuth = require("./../functions/check_auth");

router.get("/", async (req, res) => {

  const check = await CheckAuth(req, res);
  if (check.auth === false) {
    return res.status(401).json({ message: "Unauthorized", auth: false });
  } else {
    return res.status(200).json({ message: "Authorized", auth: true, data: check.data._id });
  }
});

//User Login
router.post("/", checkUser, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UsersSchema.findOne({ email }).lean();
    if (!user)
      return res
        .status(400)
        .json({ message: "User and password is wrong.", status: "warning" });
    const hashpass = user.password;
    if (!bcrypt.compareSync(password, hashpass))
      return res
        .status(400)
        .json({ message: "User and password is wrong.", status: "warning" });
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
      }
    );

    //Set cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      //Set max age 300 days
      maxAge: 1000 * 60 * 60 * 24 * 300,
      sameSite: "none",
      secure: true,
    }); //300 days

    res.setHeader("x-auth-token", token);

    res
      .status(200)
      .json({ message: "Login Successful", status: "success", token: token, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message, status: "error" });
  }
});

async function checkUser(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  //Check all filled or not
  if (
    email == "" ||
    password == "" ||
    email == undefined ||
    password == undefined ||
    email == null ||
    password == null
  ) {
    return res
      .status(400)
      .json({ message: "Please fill all fields", status: "warning" });
  }
  //Check email is valid or not
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)) {
    return res
      .status(400)
      .json({ message: "Please enter a valid email", status: "warning" });
  }

  //Check password is valid or not
  if (req.body.password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters",
      status: "warning",
    });
  }
  next();
}

module.exports = router;

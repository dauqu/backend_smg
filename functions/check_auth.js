const jwt = require("jsonwebtoken");
require("dotenv").config();
const UsersSchema = require("./../schema/users_schema");

async function CheckAuth(req, res) {
  //CHeck auth
  const token = req.headers["x-auth-token"];

  if (token === undefined || token === null || token === "") {
    return {
      message: "Unauthorized",
      auth: false,
      data: null,
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithm: "HS256",
    });

    //If id is not valid
    if (decoded.id === undefined || decoded.id === null || decoded.id === "") {
      return {
        message: "Unauthorized",
        auth: false,
        data: null,
      };
    }
    const user = await UsersSchema.findOne({ _id: decoded.id });

    // Convert the Mongoose document object to a plain JavaScript object
    const userObject = user.toObject();

    // Remove the password field from the user object
    delete userObject.password;

    //Check if user exists
    if (user === null) {
      return {
        message: "Unauthorized",
        auth: false,
        data: null,
      };
    } else {
      //Return JSON
      return {
        message: "Authorized",
        auth: true,
        data: userObject,
      };
    }
  } catch (error) {
    return {
      message: error.message,
      auth: false,
      data: null,
    };
  }
}

module.exports = CheckAuth;

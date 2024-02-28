const express = require("express");
const app = express();
require("dotenv").config();
const http = require("http").createServer(app);
const port = process.env.PORT || 3000;

const nodeCCAvenue = require("node-ccavenue");

//file upload express
const fileUpload = require("express-fileupload");
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// cors
const cors = require("cors");
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

//Connect to database
const connectDB = require("./config/database");
connectDB();

app.use(express.json());

// Configure the public folder to serve static files
app.use(express.static("./files"));

// API from routes
app.use("/fetch", require("./routes/fetch"));

app.use("/register", require("./routes/register"));
app.use("/login", require("./routes/login"));
app.use("/profile", require("./routes/profile"));
app.use("/users", require("./routes/users"));

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

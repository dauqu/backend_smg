const express = require("express");
const app = express();
require("dotenv").config();
const http = require("http").createServer(app);
const port = process.env.PORT || 4000;
// Set the view engine to ejs
app.set('view engine', 'ejs');
// Set the directory where the views are stored
app.set('views', 'views');

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

// Define a route
app.get('/', (req, res) => {
  res.render('index', { title: 'Hello, World!', message: 'Welcome to my website!' });
});

// API from routes
app.use("/type", require("./routes/type"));
app.use("/competition", require("./routes/competition"));
app.use("/event", require("./routes/event"));
app.use("/market", require("./routes/list-market"));
app.use("/market-odds", require("./routes/market-odds"));
// Database feacher from routes
app.use("/questions", require("./routes/questions"));
app.use("/options", require("./routes/option"));
app.use("/team", require("./routes/team"));
app.use("/game", require("./routes/game"));
app.use("/league", require("./routes/leagues"));

app.use("/register", require("./routes/register"));
app.use("/login", require("./routes/login"));
app.use("/profile", require("./routes/profile"));
app.use("/users", require("./routes/users"));

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

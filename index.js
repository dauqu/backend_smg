const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

require("dotenv").config();
const port = process.env.PORT || 4000;
// Set the view engine to ejs
app.set("view engine", "ejs");
// Set the directory where the views are stored
app.set("views", "views");
const expressWs = require("express-ws");
expressWs(app);

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
const { refreshData } = require("./functions/refresh");
connectDB();

app.use(express.json());

// Configure the public folder to serve static files
app.use(express.static("./files"));

// Define a route
app.get("/", (req, res) => {
  res.render("index", {
    title: "Hello, World!",
    message: "Welcome to my website!",
  });
});


setInterval(refreshData, 10000);


// WebSocket connection handler
wss.on("connection", (ws) => {
  console.log("Client connected");

  // WebSocket message handler
  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
    // Broadcast the received message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // WebSocket close handler
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// API from routes
app.use("/type", require("./routes/type"));
app.use("/competition", require("./routes/competition"));
app.use("/event", require("./routes/event"));
app.use("/market", require("./routes/list-market"));
app.use("/market-odds", require("./routes/market-odds"));
// Database feacher from routes
// app.use("/questions", require("./routes/questions"));
// app.use("/options", require("./routes/option"));
// app.use("/team", require("./routes/team"));
// app.use("/game", require("./routes/game"));
// app.use("/league", require("./routes/leagues"));

app.use("/register", require("./routes/register"));
app.use("/login", require("./routes/login"));
app.use("/profile", require("./routes/profile"));
app.use("/users", require("./routes/users"));

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

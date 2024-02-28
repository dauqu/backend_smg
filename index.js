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

app.get("/", (req, res) => {
  const ccav = new nodeCCAvenue.Configure({
    merchant_id: process.env.MERCHANT_ID,
    working_key: process.env.WORKING_KEY,
  });

  const encryptedData = ccav.encrypt(
    "Just plain text to encrypt or uri encoded order information"
  );
  console.log(encryptedData); // Proceed further

  const decryptedData = ccav.decrypt(encryptedData);
  console.log(decryptedData); // Proceed further

  const orderParams = {
    order_id: 8765432909,
    currency: "INR",
    amount: "100",
    redirect_url: encodeURIComponent(`http://localhost:3000/api/redirect_url/`),
    billing_name: "Name of the customer",
    // Add more parameters as needed
  };

  // Get encrypted order data
  const encryptedOrderData = ccav.getEncryptedOrder(orderParams);

  // Construct the form
  const formHtml = `
        <form method="post" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction">
          <input type="hidden" name="encRequest" value="${encryptedOrderData}" />
          <input type="hidden" name="access_code" value="${process.env.ACCESS_CODE}" />
          <input type="submit" value="Proceed to Payment" />
        </form>
      `;

  // Send the form to the client
  res.send(formHtml);
});

app.use("/register", require("./routes/register"));
app.use("/login", require("./routes/login"));
app.use("/profile", require("./routes/profile"));
app.use("/users", require("./routes/users"));

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const express = require("express");
const router = express.Router();
const competition_schema = require("../schema/competition_schema");
const leagues_schema = require("../schema/leagues_schema");
const slugify = require("slugify");
const mysql = require("mysql");

// Mysql config
const db = mysql.createConnection({
  host: "localhost",
  user: "bet",
  password: "7388139606",
  database: "bet",
});

//Connect to database
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Mysql Connected...");
});

//Create table if not exist

//Get all competitions
router.get("/all", (req, res) => {
  //Get only 10 competitions
  const competitions = leagues_schema.find({}).limit(10);
  //Count all competitions
  const count = leagues_schema.countDocuments();

  //Return response
  Promise.all([competitions, count])
    .then((response) => {
      res.status(200).json({ competitions: response[0], count: response[1] });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

router.get("/", async (req, res) => {
  try {
    let sql = `CREATE TABLE IF NOT EXISTS leagues (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT,
        name VARCHAR(255),
        short_name VARCHAR(255),
        slug VARCHAR(255),
        image VARCHAR(255),
        status INT
      )`;

    db.query(sql, (err, result) => {
      if (err) throw err;
      console.log(result);
      //   res.send("Leagues table created...");
    });

    // Delete all previous data
    await leagues_schema.deleteMany({});
    console.log("Previous data deleted");

    //   Delete all previous data from mysql table
    let deleteQuery = `DELETE FROM leagues`;
    db.query(deleteQuery, (err, result) => {
      if (err) {
        console.error("Error deleting data:", err);
      } else {
        console.log("Data deleted successfully:", result);
      }
    });

    // find competition by event type
    const events = await competition_schema.find({ event_type: "4" }).lean();

    for (const event of events) {
      //Generate Slug
      var slug = slugify(event.name, {
        replacement: "-",
        remove: /[*+~.()'"!:@]/g,
        lower: true,
      });

      //Generate short name like if name is Harsh Singh then short name will be HS
      var short_name = "";
      var names = event.name.split(" ");

      for (var i = 0; i < names.length; i++) {
        short_name += names[i].charAt(0);
      }
      // Save competitions to database
      // Insert data into MySQL table
      let insertQuery = `INSERT INTO leagues (category_id, name, short_name, slug, image, status) 
    VALUES (?, ?, ?, ?, ?, ?)`;
      let values = [
        1,
        event.name,
        short_name,
        slug,
        "65da0c984a3fb1708788888.png",
        1,
      ];

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error("Error inserting data:", err);
        } else {
          console.log("Data inserted successfully:", result);
        }
      });

      const leagues = new leagues_schema({
        category_id: 1,
        name: event.name,
        short_name: short_name,
        slug: slug,
        image: "65da0c984a3fb1708788888.png",
        status: "1",
      });
      await leagues.save();
    }

    // Send response indicating success
    res.status(200).json({ message: "Competitions saved successfully" });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

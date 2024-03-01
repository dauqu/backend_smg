const express = require("express");
const axios = require("axios");
const router = express.Router();
const EventSchema = require("./../schema/event_schema");
const team_schema = require("../schema/team_schema");
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

//Get all competitions
router.get("/all", (req, res) => {
  //Get only 10 competitions
  const competitions = team_schema.find({}).limit(10);
  //Count all competitions
  const count = team_schema.countDocuments();

  //Return response
  Promise.all([competitions, count])
    .then((response) => {
      res.status(200).json({ competitions: response[0], count: response[1] });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

//Get Event by Event ID
router.get("/id/:id", async (req, res) => {
  try {
    const event = await EventSchema.findById(req.params.id).lean().exec();
    res.status(200).json({ event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    let sql = `CREATE TABLE IF NOT EXISTS teams (
        id INT PRIMARY KEY,
        category_id INT,
        slug VARCHAR(255),
        name VARCHAR(255),
        short_name VARCHAR(255),
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`;

    db.query(sql, (err, result) => {
      if (err) throw err;
      console.log(result);
      //   res.send("Leagues table created...");
    });
    // Delete all previous data
    await team_schema.deleteMany({});
    console.log("Previous data deleted");

    //Delete all previous data from mysql
    let deleteQuery = `DELETE FROM teams`;
    db.query(deleteQuery, (err, result) => {
      if (err) {
        console.error("Error deleting data:", err);
      } else {
        console.log("Data deleted successfully:", result);
      }
    });

    // Get Events from database
    const events = await EventSchema.find({}).lean();
    for (const event of events) {
      // Make axios GET request
      const response = await axios.get(
        `http://142.93.36.1/api/v1/fetch_data?Action=listMarketTypes&EventID=${event.event_id}`
      );

      // console.log(response.data.runners);
      // console.log(response.data);

      // Save competitions to database
      for (const team of response.data) {
        console.log(team);
        var slug = slugify(
          team.runners[0].runnerName + team.runners[1].runnerName,
          {
            replacement: "-",
            remove: /[*+~.()'"!:@]/g,
            lower: true,
          }
        );

        // Generate Short Name
        var short_name =
          team.runners[0].runnerName.substring(0, 3) +
          "vs" +
          team.runners[1].runnerName.substring(0, 3);
        for (const tea of team.runners) {
          console.log(tea);
          //   console.log(team);

          const teams = new team_schema({
            category_id: 1,
            slug: slug,
            name: tea.runnerName,
            short_name: short_name,
            image: "65d9aadb4a5d31708763867.jpg",
          });
          await teams.save();

          let insertQuery = `INSERT INTO teams (id, category_id, slug, name, short_name, image, created_at, updated_at) VALUES ('${tea.selectionId}', '1', '${slug}', '${tea.runnerName}', '${short_name}', '65d9aadb4a5d31708763867.jpg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
          db.query(insertQuery, (err, result) => {
            if (err) {
              console.error("Error inserting data:", err);
            } else {
              console.log("Data inserted successfully:", result);
            }
          });
        }
      }
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

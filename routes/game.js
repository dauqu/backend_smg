const express = require("express");
const router = express.Router();
const market_odds = require("../schema/market_odds");
const game_schema = require("../schema/game_schema");
const question_schema = require("../schema/question_schema");
const option_schema = require("../schema/option_schema");

const mysql = require("mysql");
const { default: slugify } = require("slugify");

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
  const competitions = game_schema.find({}).limit(10);
  //Count all competitions
  const count = game_schema.countDocuments();

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
// router.get("/id/:id", async (req, res) => {
//   try {
//     const event = await EventSchema.findById(req.params.id).lean().exec();
//     res.status(200).json({ event });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

router.get("/", async (req, res) => {
  try {
    //Create game, question and option table if not exist
    let sql = `CREATE TABLE IF NOT EXISTS games (
      id VARCHAR(255) PRIMARY KEY,
      team_one_id INT,
      team_two_id INT,
      league_id VARCHAR(255),
      slug VARCHAR(255),
      start_time VARCHAR(255),
      bet_start_time VARCHAR(255),
      bet_end_time VARCHAR(255),
      status INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
  `;

    let sql2 = `CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        game_id VARCHAR(255),
        title VARCHAR(255),
        status VARCHAR(255),
        locked INT,
        result VARCHAR(255),
        refund VARCHAR(255),
        win_option_id VARCHAR(255),
        amount_refunded INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`;

    let sql3 = `CREATE TABLE IF NOT EXISTS options (
          id INT AUTO_INCREMENT PRIMARY KEY,
          question_id INT,
          option_type VARCHAR(255),  -- Add option_type column
          name VARCHAR(255),
          odds VARCHAR(255),
          status VARCHAR(255),
          locked VARCHAR(255),
          winner VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )`;

    db.query(sql, (err, result) => {
      if (err) throw err;
      // console.log(result);
      //   res.send("Leagues table created...");
    });

    db.query(sql2, (err, result) => {
      if (err) throw err;
      // console.log(result);
      //   res.send("Leagues table created...");
    });

    db.query(sql3, (err, result) => {
      if (err) throw err;
      // console.log(result);
      //   res.send("Leagues table created...");
    });

    // Delete all previous data
    await game_schema.deleteMany({});
    await question_schema.deleteMany({});
    await option_schema.deleteMany({});
    // console.log("Previous data deleted");

    //Delete all previous data from mysql
    let deleteQuery = `DELETE FROM games`;
    db.query(deleteQuery, (err, result) => {
      if (err) {
        console.error("Error deleting data:", err);
      } else {
        console.log("Data deleted successfully:", result);
      }
    });

    let deleteQuery2 = `DELETE FROM questions`;
    db.query(deleteQuery2, (err, result) => {
      if (err) {
        console.error("Error deleting data:", err);
      } else {
        console.log("Data deleted successfully:", result);
      }
    });

    let deleteQuery3 = `DELETE FROM options`;
    db.query(deleteQuery3, (err, result) => {
      if (err) {
        console.error("Error deleting data:", err);
      } else {
        console.log("Data deleted successfully:", result);
      }
    });

    // Get Events from database
    const markets = await market_odds.find({}).lean();
    for (const market of markets) {
      for (const runner of market.runners) {
        // console.log(market.runners);
        var slug = slugify(
          market.runners[0].runner + market.runners[1].runner,
          {
            replacement: "-",
            remove: /[*+~.()'"!:@]/g,
            lower: true,
          }
        );

        // //Generate Short Name
        // var short_name = team.runners[0].runnerName.substring(0, 3) + "vs" + team.runners[1].runnerName.substring(0, 3);

        const ga = new game_schema({
          team_one_id: market.runners[0].selectionId,
          team_two_id: market.runners[1].selectionId,
          league_id: market.event_id,
          slug: "slug",
          start_time: market.marketStartTime,
          bet_start_time: market.betStartTime,
          bet_end_time: market.betEndTime,
          status: market.status,
        });
        const gameid = await ga.save();

        // Access the generated _id
        let insertedGameId = gameid._id;

        // Generate a unique slug
        let insertQuery = `INSERT INTO games (id, team_one_id, team_two_id, league_id, slug, start_time, bet_start_time, bet_end_time, status, created_at, updated_at) VALUES ('${insertedGameId}', '${market.runners[0].selectionId}', '${market.runners[1].selectionId}', '50', '${slug}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '2025-01-01 00:00:00',  1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

        db.query(insertQuery, (err, result) => {
          if (err) {
            console.error("Error inserting data:", err);
          } else {
            console.log("Data inserted successfully:", result);
          }
        });

        //Insert Question in database
        for (const team of market.runners) {
          const question = new question_schema({
            game_id: insertedGameId,
            title: team.runner,
            status: "active",
            locked: 0,
            result: "pending",
            refund: "pending",
            win_option_id: "pending",
            amount_refunded: 0,
          });
          const savedQuestion = await question.save();
          const questionId = savedQuestion._id;

          //Insert data in my sql table
          let insertQuery2 = `INSERT INTO questions (game_id, title, status, locked, result, refund, win_option_id, amount_refunded, created_at, updated_at) VALUES ('${insertedGameId}', '${team.runner}', 1, 0, 0, 0, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
          db.query(insertQuery2, (err, result) => {
            if (err) {
              console.error("Error inserting data:", err);
            } else {
              console.log("Data inserted successfully:", result);
              //Save inserted id
              insered_id = result.insertId;
            }
          });

          //availableToLay
          for (const options of team.ex.availableToLay) {
            // console.log(options);
            const option = new option_schema({
              question_id: questionId,
              type: "availableToLay",
              name: options.size,
              odds: options.price,
              status: "",
              locked: "",
              winner: "",
            });
            await option.save();

            //Insert data in my sql table
            let insertQuery3 = `INSERT INTO options (question_id, option_type, name, odds, status, locked, winner, created_at, updated_at) VALUES ('${questionId}', 'availableToLay', '${options.size}', '${options.price}', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
            db.query(insertQuery3, (err, result) => {
              if (err) {
                console.error("Error inserting data:", err);
              } else {
                console.log("Data inserted successfully:", result);
              }
            });
          }

          // availableToBack
          // for (const options of team.ex.availableToBack) {
          //   // console.log(options);
          //   const option = new option_schema({
          //     question_id: questionId,
          //     type: "availableToBack",
          //     name: options.size,
          //     odds: options.price,
          //     status: "",
          //     locked: "",
          //     winner: "",
          //   });
          //   await option.save();

          //   //Insert data in my sql table
          //   let insertQuery4 = `INSERT INTO options (question_id, option_type, name, odds, status, locked, winner, created_at, updated_at) VALUES ('${questionId}', 'availableToBack', '${options.size}', '${options.price}', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
          //   db.query(insertQuery4, (err, result) => {
          //     if (err) {
          //       console.error("Error inserting data:", err);
          //     } else {
          //       console.log("Data inserted successfully:", result);
          //     }
          //   });
          // }
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

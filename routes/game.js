const express = require("express");
const axios = require("axios");
const router = express.Router();
const slugify = require("slugify");
const market_odds = require("../schema/market_odds");
const game_schema = require("../schema/game_schema");
const question_schema = require("../schema/question_schema");
const option_schema = require("../schema/option_schema");

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
    // Delete all previous data
    await game_schema.deleteMany({});
    await question_schema.deleteMany({});
    await option_schema.deleteMany({});
    console.log("Previous data deleted");

    // Get Events from database
    const markets = await market_odds.find({}).lean();
    for (const market of markets) {
      console.log(market.runners);
      // Save competitions to database
      //   for (const game of response.data) {
      // var slug = slugify(
      //     game.runners[0].runnerName + game.runners[1].runnerName,
      //   {
      //     replacement: "-",
      //     remove: /[*+~.()'"!:@]/g,
      //     lower: true,
      //   }
      // );

      // //Generate Short Name
      // var short_name = team.runners[0].runnerName.substring(0, 3) + "vs" + team.runners[1].runnerName.substring(0, 3);

      const ga = new game_schema({
        team_one_id: market.runners[0].selectionId,
        team_two_id: market.runners[1].selectionId,
        league_id: market.event_id,
        //   slug: slug,
        start_time: market.marketStartTime,
        bet_start_time: market.betStartTime,
        bet_end_time: market.betEndTime,
        status: market.status,
      });
      const savedGame = await ga.save();

      // Access the generated _id
      const insertedGameId = savedGame._id;

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
        //availableToLay
        for (const options of team.ex.availableToLay) {
          console.log(options);
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
        }

        // availableToBack
        for (const options of team.ex.availableToBack) {
          console.log(options);
          const option = new option_schema({
            question_id: questionId,
            type: "availableToBack",
            name: options.size,
            odds: options.price,
            status: "",
            locked: "",
            winner: "",
          });
          await option.save();
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

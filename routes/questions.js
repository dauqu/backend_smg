const express = require("express");
const router = express.Router();
const axios = require("axios");
const market_odds = require("../schema/market_odds");
const question_schema = require("../schema/question_schema");
const option_schema = require("../schema/option_schema");

//Get all competitions
router.get("/all", (req, res) => {
  //Get only 10 competitions
  const competitions = question_schema.find({}).limit(3);
  //Count all competitions
  const count = question_schema.countDocuments();

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
    // Delete all previous data
    await question_schema.deleteMany({});
    await option_schema.deleteMany({});
    console.log("Previous data deleted");

    // Get Events from database
    const odds = await market_odds.find({}).lean();
    for (const event of odds) {
      for (const ques of event.runners) {
        const question = new question_schema({
          game_id: ques.selectionId,
          title: ques.runner,
          status: "active",
          locked: 0,
          result: "pending",
          refund: "pending",
          win_option_id: "pending",
          amount_refunded: 0,
        });
        await question.save();

        //availableToLay
        for (const options of ques.ex.availableToLay) {
          console.log(options);
          const option = new option_schema({
            question_id: "availableToLay",
            name: options.size,
            odds: options.price,
            status: "",
            locked: "",
            winner: "",
          });
          await option.save();
        }

        // availableToBack
        for (const options of ques.ex.availableToBack) {
          console.log(options);
          const option = new option_schema({
            question_id: "availableToBack",
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

const express = require("express");
const bet_schema = require("../schema/bet_schema");
const CheckAuth = require("../functions/check_auth");
const router = express.Router();

//Get my bets
router.get("/", async (req, res) => {
  //Check auth
  const check = await CheckAuth(req, res);

  //Check if user is authorized
  if (check.auth === false) {
    return res
      .status(401)
      .json({ message: "Login to view your bets", auth: false, data: null });
  }

  //Get all bets
  const bets = await bet_schema.find({ user_id: check.data._id });

  //Return response
  res.status(200).json({ bets: bets });
});

router.post("/", async (req, res) => {
  //Check auth
  const check = await CheckAuth(req, res);
  //Check if user is authorized
  if (check.auth === false) {
    return res
      .status(401)
      .json({ message: "Login to place a bet", auth: false, data: null });
  }

  //Check both field have data or not
  if (req.body.data === undefined || req.body.data === null) {
    return res.status(400).json({ message: "No data to place bet" });
  } else if (req.body.data.length === 0) {
    return res.status(400).json({ message: "No data to place bet" });
  }

  //Check stack have data or not
  if (
    req.body.stack === undefined ||
    req.body.stack === null ||
    req.body.stack === ""
  ) {
    return res.status(400).json({ message: "No stack to place bet" });
  }

  //Min bet require 1
  if (req.body.data.length < 1) {
    return res.status(400).json({ message: "Minimum 1 bet required" });
  }

  try {
    //Loop req.body.data
    //Loop req.body.data
    for (const element of req.body.data) {
      const bet = new bet_schema({
        user_id: check.data._id,
        event_name: element.event_name,
        market_name: element.market_name,
        bet_amount: element.price,
        type: element.type,
        stack: req.body.stack,
      });

      await bet.save();
    }

    res.status(200).json({ message: "Bet placed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

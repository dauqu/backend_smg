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
  console.log(check);
  //Check if user is authorized
  if (check.auth === false) {
    return res
      .status(401)
      .json({ message: "Login to place a bet", auth: false, data: null });
  }

    //Get all fields
    const event_name = req.body.event_name;
    const bet_amount = req.body.bet_amount;
    const stack = req.body.stack;
    const type = req.body.type;

  //Check all field are present
  if (
    event_name === undefined ||
    event_name === null ||
    event_name === "" ||
    bet_amount === undefined ||
    bet_amount === null ||
    bet_amount === "" ||
    stack === undefined ||
    stack === null ||
    stack === "" ||
    type === undefined ||
    type === null ||
    type === ""
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const bet = new bet_schema({
        user_id: check.data._id,
        event_name: req.body.event_name,
        bet_amount: req.body.bet_amount,
        type: req.body.bet,
        stack: req.body.stack,
    });

    await bet.save();
    res.status(200).json({ message: "Bet placed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

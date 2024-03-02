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

  //Check all field are present
  if (
    req.body.bet_amount === undefined ||
    req.body.bet_amount === null ||
    req.body.bet_amount === "" ||
    req.body.bet_type === undefined ||
    req.body.bet_type === null ||
    req.body.bet_type === "" ||
    req.body.bet_number === undefined ||
    req.body.bet_number === null ||
    req.body.bet_number === ""
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const bet = new bet_schema({
      user_id: check.data._id,
      bet_amount: req.body.bet_amount,
      bet_type: req.body.bet_type,
      bet_number: req.body.bet_number,
    });

    await bet.save();
    res.status(200).json({ message: "Bet placed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

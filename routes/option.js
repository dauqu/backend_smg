const express = require("express");
const option_schema = require("../schema/option_schema");
const router = express.Router();


//Get all competitions
router.get("/all", (req, res) => {
  //Get only 10 competitions
  const competitions = option_schema.find({}).limit(3);
  //Count all competitions
  const count = option_schema.countDocuments();

  //Return response
  Promise.all([competitions, count])
    .then((response) => {
      res.status(200).json({ competitions: response[0], count: response[1] });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

module.exports = router;

const express = require("express");
const axios = require("axios");
const router = express.Router();
const list_market_schema = require("../schema/list_market_schema");
const market_odds = require("../schema/market_odds");

//Get all competitions
router.get("/all", (req, res) => {
  //Get only 10 competitions
  const competitions = market_odds.find({}).limit(3);
  //Count all competitions 
  const count = market_odds.countDocuments();

  //Return response
  Promise.all([competitions, count])
    .then((response) => {
      res.status(200).json({ market: response[0], count: response[1] });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

//Get by market id
router.get("/id/:id", async (req, res) => {
  try {
    const market = await market_odds.find({ market_id: req.params.id }).lean().exec();
    res.status(200).json({ market });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    // Delete all previous data
    await market_odds.deleteMany({});
    // console.log("Previous data deleted");

    // Get Events from database
    const events = await list_market_schema.find({}).lean();
    for (const event of events) {
      // Make axios GET request
      const response = await axios.get(
        `http://142.93.36.1/api/v1/listMarketBookOdds?market_id=${event.market_id}`
      );

      // Save competitions to database  
      for (const element of response.data) {
        // console.log(element);
        const market = new market_odds({
          event_id: element.eventid,
          market_id: element.marketId,
          market: element.market,
          update_time: element.updateTime,
          status: element.status,
          inplay: element.inplay,
          total_matched: element.totalMatched,
          active: element.active,
          market_type: element.markettype,
          runners: element.runners,
        });
        await market.save();
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

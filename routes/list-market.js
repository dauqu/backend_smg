const express = require("express");
const axios = require("axios");
const router = express.Router();
const EventSchema = require("./../schema/event_schema");
const list_market_schema = require("../schema/list_market_schema");

//Get all competitions
router.get("/all", (req, res) => {
  //Get only 10 competitions
  const competitions = list_market_schema.find({}).limit(5);
  //Count all competitions
  const count = list_market_schema.countDocuments();

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
    await list_market_schema.deleteMany({});
    console.log("Previous data deleted");

    // Get Events from database
    const events = await EventSchema.find({}).lean();
    for (const event of events) {
      // Make axios GET request
      const response = await axios.get(
        `http://142.93.36.1/api/v1/fetch_data?Action=listMarketTypes&EventID=${event.event_id}`
      );

      //   console.log(response.data);

      // Save competitions to database
      for (const element of response.data) {
        const market = new list_market_schema({
          market_id: element.marketId,
          market_name: element.marketName,
          market_start_time: element.marketStartTime,
          total_matched: element.totalMatched,
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

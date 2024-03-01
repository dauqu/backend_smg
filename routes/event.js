const express = require("express");
const axios = require("axios");
const router = express.Router();
const competition_schema = require("../schema/competition_schema");
const EventSchema = require("./../schema/event_schema");

//Get all competitions
router.get("/all", (req, res) => {
  //Get only 10 competitions
  const competitions = EventSchema.find({}).limit(10);
  //Count all competitions
  const count = EventSchema.countDocuments();

  //Return response
  Promise.all([competitions, count])
    .then((response) => {
      res.status(200).json({ events: response[0], count: response[1] });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

//Get Event by Event ID
router.get("/id/:id", async (req, res) => {
  try {
    const event = await EventSchema.find({
      competition_id: req.params.id,
    }).lean().limit(5);

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    // Delete all previous data
    await EventSchema.deleteMany({});
    console.log("Previous data deleted");

    // Get Events from database
    const events = await competition_schema.find({ event_type: "4" }).lean();
    for (const event of events) {
      // Make axios GET request
      const response = await axios.get(
        `http://142.93.36.1/api/v1/fetch_data?Action=listEvents&EventTypeID=${event.event_type}&CompetitionID=${event.id}`
      );

      //   console.log(response.data);

      // Save competitions to database
      for (const element of response.data) {

        const market_type = await axios.get(
          `http://142.93.36.1/api/v1/fetch_data?Action=listMarketTypes&EventID=28102621`
        );

        const market_odds = await axios.get(
          `http://142.93.36.1/api/v1/listMarketBookOdds?market_id=${market_type.data[0].marketId}`
        );

        const save_competition = new EventSchema({
          event_id: element.event.id,
          event_name: element.event.name,
          competition_id: event.id,
          country_code: element.event.countryCode,
          timezone: element.event.timezone,
          open_date: element.event.openDate,
          market_count: element.marketCount,
          scoreboard_id: element.scoreboard_id,
          selections: element.selections,
          liability_type: element.liability_type,
          undeclared_market: element.undeclared_market,
          market_type: market_type.data,
          market_odds: market_odds.data,
        });
        await save_competition.save();
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

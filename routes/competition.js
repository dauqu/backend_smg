const express = require("express");
const router = express.Router();
const axios = require("axios");
const Type_Schema = require("../schema/type_schema");
const competition_schema = require("../schema/competition_schema");

//Get all competitions
router.get("/all", (req, res) => {
  //Get only 10 competitions
  const competitions = competition_schema.find({}).limit(10);
  //Count all competitions
  const count = competition_schema.countDocuments();

  //Return response
  Promise.all([competitions, count])
    .then((response) => {
      res.status(200).json({ competitions: response[0], count: response[1] });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

//Get by event_type
router.get("/id/:event_type", (req, res) => {
  //Get only 10 competitions
  const competitions = competition_schema
    .find({ event_type: req.params.event_type })
    .limit(10);
  //Count all competitions
  const count = competition_schema.countDocuments({
    event_type: req.params.event_type,
  });

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
    await competition_schema.deleteMany({});
    console.log("Previous data deleted");

    // Get Events from database
    const events = await Type_Schema.find({}).lean();
    for (const event of events) {
      // Make axios GET request
      const response = await axios.get(
        `http://142.93.36.1/api/v1/fetch_data?Action=listCompetitions&EventTypeID=${event.event_type}`
      );

      // Save competitions to database
      for (const element of response.data) {
        const save_competition = new competition_schema({
          id: element.competition.id,
          name: element.competition.name,
          event_type: event.event_type,
          market_count: element.marketCount,
          competition_region: element.competitionRegion,
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

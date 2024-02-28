const express = require("express");
const router = express.Router();
const axios = require("axios");
const Events_Schema = require("../schema/Events_Schema");
const competition_schema = require("../schema/competition_schema");

router.get("/event", (req, res) => {
  // API
  const url = "http://142.93.36.1/api/v1/fetch_data?Action=listEventTypes";

  //Make axios GET request
  axios
    .get(url)
    .then((response) => {
      //Run API response in a loop
      response.data.forEach((element) => {
        //Save to database
        const save_event = new Events_Schema({
          event_type: element.eventType,
          event_name: element.name,
          market_count: element.marketCount,
        });

        save_event.save();
      });
      res.status(200).json({ message: "Events fetched and saved to database" });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

// listCompetitions
router.get("/competition", (req, res) => {

  //Get Events from database
  Events_Schema.find()
    .then((events) => {
      events.forEach((event) => {
        //Make axios GET request
        axios
          .get(
            `http://142.93.36.1/api/v1/fetch_data?Action=listCompetitions&EventTypeID=${event.event_type}`
          )
          .then((response) => {
            //Run API response in a loop
            response.data.forEach((element) => {
              //Save to database
              const save_competition = new competition_schema({
                id: element.competition.id,
                event_id: event.id,
                name: element.competition.name,
                market_count: element.marketCount,
                competition_region: element.competitionRegion,
              });

              save_competition.save();
            });
            res.status(200).json({
              message: "Competitions fetched and saved to database",
            });
          })
          .catch((error) => {
            res.status(500).json({ message: error.message });
          });
      });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});
module.exports = router;

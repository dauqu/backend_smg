const express = require("express");
const router = express.Router();
const axios = require("axios");
const Events_Schema = require("../schema/Events_Schema");

router.get("/event", (req, res) => {
  // API
  const url = "http://142.93.36.1/api/v1/fetch_data?Action=listEventTypes";

  //Make axios GET request
  axios
    .get(url)
    .then((response) => {

      //Remove all old 
      Events_Schema.remove({}, function (err) {
        if (err) {
          console.log(err);
        }
      });

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

module.exports = router;

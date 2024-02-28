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
      Events_Schema.deleteMany({}, (err) => {
        if (err) {
          res.status(500).json({ message: err.message });
        }
      });
      
      //Run API response in a loop
      response.data.forEach((element) => {
        //Save to database
        const save_event = new Events_Schema({
          event_type: element.event_type,
          event_name: element.event_name,
          market_count: element.market_count,
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

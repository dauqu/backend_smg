const express = require("express");
const router = express.Router();
const axios = require("axios");
const Type_Schema = require("../schema/type_schema");

router.get("/all", (req, res) => {
  //Get all events
  Type_Schema.find({})
    .then((types) => {
      res.status(200).json({ types });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

router.get("/", (req, res) => {
  // API
  const url = "http://142.93.36.1/api/v1/fetch_data?Action=listEventTypes";

  Type_Schema.deleteMany({}).then(() => {
    console.log("Previous data deleted");
  });

  //Make axios GET request
  axios
    .get(url)
    .then((response) => {
      //Run API response in a loop
      response.data.forEach((element) => {
        //Save to database
        const save_event = new Type_Schema({
          event_type: element.eventType,
          type_name: element.name,
          type_count: element.marketCount,
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

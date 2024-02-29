const express = require("express");
const axios = require("axios");
const router = express.Router();
const EventSchema = require("./../schema/event_schema");
const team_schema = require("../schema/team_schema");
const slugify = require("slugify");

//Get all competitions
router.get("/all", (req, res) => {
  //Get only 10 competitions
  const competitions = team_schema.find({}).limit(10);
  //Count all competitions
  const count = team_schema.countDocuments();

  //Return response
  Promise.all([competitions, count])
    .then((response) => {
      res.status(200).json({ competitions: response[0], count: response[1] });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

//Get Event by Event ID
router.get("/id/:id", async (req, res) => {
  try {
    const event = await EventSchema.findById(req.params.id).lean().exec();
    res.status(200).json({ event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    // Delete all previous data
    await team_schema.deleteMany({});
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
      for (const team of response.data) {
        var slug = slugify(
          team.runners[0].runnerName + team.runners[1].runnerName,
          {
            replacement: "-",
            remove: /[*+~.()'"!:@]/g,
            lower: true,
          }
        );

        //Generate Short Name 
        var short_name = team.runners[0].runnerName.substring(0, 3) + "vs" + team.runners[1].runnerName.substring(0, 3);

        const teams = new team_schema({
          category_id: 1,
          slug: slug,
          name: team.marketName,
          short_name: short_name,
          image: "65d9aadb4a5d31708763867.jpg",
        });
        await teams.save();
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

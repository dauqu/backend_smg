const { default: axios } = require("axios");
const competition_schema = require("../schema/competition_schema");
const event_schema = require("../schema/event_schema");

async function refreshData() {
  // WebSocket message handler
  try {
    // Delete all previous data
    // await event_schema.deleteMany({});
    console.log("Previous data deleted");

    // Get Events from database
    const events = await competition_schema.find({ event_type: "4" }).lean();
    for (const event of events) {
      // Make axios GET request
      const response = await axios.get(
        `http://142.93.36.1/api/v1/fetch_data?Action=listEvents&EventTypeID=${event.event_type}&CompetitionID=${event.id}`
      );
      // console.log(response.data)
      //   console.log(response.data);

      // Save competitions to database
      for (const element of response.data) {
        // console.log(element);

        //Skip if event is not available
        const market_type = await axios.get(
          `http://142.93.36.1/api/v1/fetch_data?Action=listMarketTypes&EventID=${element.event.id}`
        );

        const market_odds = await axios.get(
          `http://142.93.36.1/api/v1/listMarketBookOdds?market_id=${market_type.data[0].marketId}`
        );

        // const save_competition = new event_schema({
        //   event_id: element.event.id,
        //   event_name: element.event.name,
        //   competition_id: event.id,
        //   country_code: element.event.countryCode,
        //   timezone: element.event.timezone,
        //   open_date: element.event.openDate,
        //   market_count: element.marketCount,
        //   scoreboard_id: element.scoreboard_id,
        //   selections: element.selections,
        //   liability_type: element.liability_type,
        //   undeclared_market: element.undeclared_market,
        //   market_type: market_type.data,
        //   market_odds: market_odds.data,
        // });
        // await save_competition.save();

        for (const element of response.data) {
          const existingEvent = await event_schema.findOne({
            event_id: element.event.id,
          });

          if (existingEvent) {
            // Update existing event
            await event_schema.updateOne(
              { event_id: element.event.id },
              {
                $set: {
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
                },
              }
            );
          } else {
            // Save new event
            const save_competition = new event_schema({
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
        console.log("Done");
      }
    }
    // Send response indicating success
    console.log("Done");
  } catch (error) {
    // Handle errors
    console.error(error);
  }
}

//Export function
module.exports = { refreshData };

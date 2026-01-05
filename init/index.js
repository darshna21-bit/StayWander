const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  const listingsWithGeometry = [];

  for (let obj of initData.data) {
    const query = `${obj.location}, ${obj.country}`;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
      );
      const geoData = await response.json();

      // if location not found, skip
      if (!geoData.length) {
        console.log(`Location not found: ${query}`);
        continue;
      }

      listingsWithGeometry.push({
        ...obj,
        owner: "695b7b9d51b094b7212142ff", // default owner
        geometry: {
          type: "Point",
          coordinates: [
            parseFloat(geoData[0].lon), // longitude
            parseFloat(geoData[0].lat), // latitude
          ],
        },
      });
    } catch (err) {
      console.log("Error geocoding:", query, err.message);
    }
  }

  await Listing.insertMany(listingsWithGeometry);
  console.log("data was initialized with geometry");
};

initDB();

const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,

    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,

    // 🔹 NEW FIELD (FILTERS)
    category: [{
        type: String,
        enum: [
            "Rooms",
            "Iconic cities",
            "Mountains",
            "Castles",
            "Amazing pools",
            "Camping",
            "Farms",
            "Arctic",
            "Domes",
            "Boats"
        ],
    }],

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },


});

listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing) {
        await Review.deleteMany({_id : {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
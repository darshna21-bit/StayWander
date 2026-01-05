const Listing = require("../models/listing");

// ✅ INDEX with CATEGORY FILTER
module.exports.index = async (req, res) => {
    const { category, q } = req.query;

    let filter = {};

    // 🔍 SEARCH LOGIC
    if (q) {
        filter.$or = [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } },
            { category: { $in: [q] } }
        ];
    }

    // 🏷️ CATEGORY FILTER (from buttons)
    if (category) {
        filter.category = category;
    }

    const allListings = await Listing.find(filter);

    res.render("listings/index.ejs", {
        allListings,
        category,
        q
    });
};


// -----------------------------

module.exports.rendernewForm = (req, res) => {   
    res.render("listings/new.ejs");
};
module.exports.showListing = async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id)
           .populate({
                path: "reviews",
                populate: {
                    path: "author",
                },
            })
           .populate("owner");
        if(!listing) {
            req.flash("error", "Listing you requested for does not exist!");
             return res.redirect("/listings");
        }
        console.log(listing);
        res.render("listings/show.ejs", { listing });

    };
module.exports.createListing = async (req, res, next) => {
        // 1. Get location entered by user
        const location = req.body.listing.location;  //jaipur rajasthan
        const country = req.body.listing.country;     // e.g. India

        const fullAddress = `${location}, ${country}`;
        

        // 2. Call OpenStreetMap Geocoding API
        const geoResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${fullAddress}&limit=1`
        );
        const geoData = await geoResponse.json();

        // 3. Safety check
        if (!geoData.length) {
                req.flash("error", "Invalid location");
                return res.redirect("/listings/new");
        }

        // 4. Convert to GeoJSON format (IMPORTANT)
        const geometry = {
                type: "Point",
                coordinates: [
                Number(geoData[0].lon), // longitude FIRST
                Number(geoData[0].lat)  // latitude SECOND
                ]
        };

        let url = req.file.path;
        let filename = req.file.filename;

        const newListing = new Listing(req.body.listing);

        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        newListing.geometry = geometry; // ⭐ SAME STEP AS MA’AM

        let savedListing = await newListing.save();
        console.log(savedListing);
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
};
module.exports.renderEditForm = async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        if(!listing) {
            req.flash("error", "Listing you requested for does not exist!");
             return res.redirect("/listings");
        }
        let originalImageUrl = listing.image.url;
        originalImageUrl = originalImageUrl.replace("/upload/", "/upload/w_250/");
        res.render("listings/edit.ejs", { listing, originalImageUrl});

};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findById(id);

    // ✅ 1. Update basic fields
    listing.set(req.body.listing);

    // ✅ 2. If location changed → re-geocode
    if (req.body.listing.location) {
        const location = req.body.listing.location;
        const country = req.body.listing.country;

        const fullAddress = `${location}, ${country}`;

        const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${fullAddress}&limit=1`
        );
        const geoData = await geoResponse.json();

        if (!geoData.length) {
            req.flash("error", "Invalid location");
            return res.redirect(`/listings/${id}/edit`);
        }

        listing.geometry = {
            type: "Point",
            coordinates: [
                Number(geoData[0].lon),
                Number(geoData[0].lat)
            ]
        };
    }

    // ✅ 3. If new image uploaded
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
        let { id } = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        req.flash("success", "Listing Deleted!");
        console.log(deletedListing);
        res.redirect("/listings");
};
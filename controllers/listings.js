const axios = require("axios");
const Listing = require("../models/listing");

// ================= INDEX =================
module.exports.index = async (req, res) => {
  const { category, q } = req.query;
  let filter = {};

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
      { category: { $in: [q] } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  const allListings = await Listing.find(filter);
  res.render("listings/index.ejs", { allListings, category, q });
};

// ================= NEW FORM =================
module.exports.rendernewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// ================= SHOW =================
module.exports.showListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

// ================= CREATE =================
module.exports.createListing = async (req, res) => {
  const { location, country } = req.body.listing;
  const fullAddress = `${location}, ${country}`;

  // 🔥 axios + User-Agent (FIXED)
  const geoResponse = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        format: "json",
        q: fullAddress,
        limit: 1,
      },
      headers: {
        "User-Agent": "StayWander/1.0 (darshna21-bit)",
      },
    }
  );

  const geoData = geoResponse.data;

  if (!geoData.length) {
    req.flash("error", "Invalid location");
    return res.redirect("/listings/new");
  }

  const geometry = {
    type: "Point",
    coordinates: [
      Number(geoData[0].lon),
      Number(geoData[0].lat),
    ],
  };

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {
    url: req.file.path,
    filename: req.file.filename,
  };
  newListing.geometry = geometry;

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

// ================= EDIT FORM =================
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url.replace(
    "/upload/",
    "/upload/w_250/"
  );

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// ================= UPDATE =================
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  listing.set(req.body.listing);

  if (req.body.listing.location) {
    const fullAddress = `${req.body.listing.location}, ${req.body.listing.country}`;

    // 🔥 axios + User-Agent (FIXED)
    const geoResponse = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          format: "json",
          q: fullAddress,
          limit: 1,
        },
        headers: {
          "User-Agent": "StayWander/1.0 (darshna21-bit)",
        },
      }
    );

    const geoData = geoResponse.data;

    if (!geoData.length) {
      req.flash("error", "Invalid location");
      return res.redirect(`/listings/${id}/edit`);
    }

    listing.geometry = {
      type: "Point",
      coordinates: [
        Number(geoData[0].lon),
        Number(geoData[0].lat),
      ],
    };
  }

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

// ================= DELETE =================
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

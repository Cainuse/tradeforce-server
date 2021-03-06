const express = require("express");
const router = express.Router();
const Posting = require("../models/Posting");
const Offering = require("../models/Offering");
const User = require("../models/User").User;
const Notifications = require("../utils/notificationsUtil");

// http://localhost/api/postings ///////////////////////////////////////////////////////
// GET
// Returns all postings
router.get("/", async (req, res) => {
  try {
    const postings = await Posting.find();
    res.status(200).json(postings);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// GET
// returns a page of active postings
router.get("/active/:page", async (req, res) => {
  const resultsPerPage = 12;
  const currentPage = req.params.page;
  try {
    const postings = await Posting.find({ active: true })
      .sort({ date: "desc" })
      .skip(resultsPerPage * currentPage - resultsPerPage)
      .limit(resultsPerPage);
    const totalResultsCount = await Posting.countDocuments({
      active: true,
    });
    const totalPages = Math.ceil(totalResultsCount / resultsPerPage);
    const postingPreviews = postings.map((post) => ({
      _id: post._id,
      date: post.date,
      title: post.title,
      location: post.location,
      images: [post.images[0]],
      ownerId: post.ownerId,
    }));
    res.status(200).json({
      numResults: totalResultsCount,
      numPages: totalPages,
      postingPreviews: postingPreviews,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// GET
// returns all active postings
router.get("/active", async (req, res) => {
  try {
    const postings = await Posting.find({ active: true }).sort({
      date: "desc",
    });
    const postingPreviews = postings.map((post) => ({
      _id: post._id,
      date: post.date,
      title: post.title,
      location: post.location,
      images: [post.images[0]],
      ownerId: post.ownerId,
    }));
    res.status(200).json(postingPreviews);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// GET
// Returns all postings whose fields contain search query
router.get("/search/:query", async (req, res) => {
  try {
    let queryParams = { active: true };
    let params = new URLSearchParams(req.params.query);
    params.forEach((value, key) => {
      if (key === "category") {
        if (value !== "all") {
          queryParams[key] = value;
        }
      } else if (key === "search") {
        queryParams["$text"] = { $search: value };
      } else {
        queryParams[key] = value;
      }
    });
    const postings = await Posting.find(queryParams, {
      score: { $meta: "textScore" },
    }).sort({ date: "desc", score: { $meta: "textScore" } });

    const postingPreviews = postings.map((post) => ({
      _id: post._id,
      date: post.date,
      title: post.title,
      location: post.location,
      images: [post.images[0]],
      ownerId: post.ownerId,
    }));
    res.status(200).json(postingPreviews);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// GET
// Returns a page of postings whose fields contain search query
router.get("/search/:query/:page", async (req, res) => {
  const resultsPerPage = 12;
  const currentPage = req.params.page;
  try {
    let queryParams = { active: true };
    let params = new URLSearchParams(req.params.query);
    params.forEach((value, key) => {
      if (key === "category") {
        if (value !== "all") {
          queryParams[key] = value;
        }
      } else if (key === "search") {
        queryParams["$text"] = { $search: value };
      } else {
        queryParams[key] = value;
      }
    });
    const postings = await Posting.find(queryParams, {
      score: { $meta: "textScore" },
    })
      .sort({ date: "desc", score: { $meta: "textScore" } })
      .skip(resultsPerPage * currentPage - resultsPerPage)
      .limit(resultsPerPage);

    const totalResultsCount = await Posting.countDocuments(queryParams);
    const totalPages = Math.ceil(totalResultsCount / resultsPerPage);

    const postingPreviews = postings.map((post) => ({
      _id: post._id,
      date: post.date,
      title: post.title,
      location: post.location,
      images: [post.images[0]],
      ownerId: post.ownerId,
    }));

    res.status(200).json({
      numResults: totalResultsCount,
      numPages: totalPages,
      postingPreviews: postingPreviews,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// POST
// Creates new posting based on input parameters
router.post("/", async (req, res) => {
  const reqBody = req.body;

  const owner = await User.findOne({ _id: reqBody.ownerId });

  const posting = new Posting({
    title: reqBody.title,
    date: reqBody.date,
    description: reqBody.description,
    category: reqBody.category,
    condition: reqBody.condition,
    quantity: reqBody.quantity,
    tags: reqBody.tags,
    requestedItems: reqBody.requestedItems,
    images: reqBody.images,
    ownerId: reqBody.ownerId,
    location: owner.location,
  });

  try {
    const savedPosting = await posting.save();
    res.status(201).json(savedPosting);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});
// http://localhost/api/postings/{postingId} ////////////////////////////////////////////
// GET
router.get("/:postingId", async (req, res) => {
  try {
    const posting = await Posting.findById(req.params.postingId);
    if (!posting) {
      res.status(404).send();
    }
    res.status(200).json(posting);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// DELETE
router.delete("/:postingId", async (req, res) => {
  try {
    await Posting.deleteOne({ _id: req.params.postingId });
    res.status(204).send();
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// PATCH
router.patch("/:postingId", async (req, res) => {
  try {
    const updatedPosting = await Posting.updateOne(
      { _id: req.params.postingId },
      { $set: req.body }
    );
    res.status(200).json(updatedPosting);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// http://localhost/api/postings/{postingId}/offerings ////////////////////////////////////////////
// GET
// Fetch all offerings of given posting
router.get("/:postingId/offerings", async (req, res) => {
  try {
    const offeringsOfPosting = await Offering.find({
      postingId: req.params.postingId,
    });
    res.status(200).json(offeringsOfPosting);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// POST
// Create new offering for posting
router.post("/:postingId/offerings", async (req, res) => {
  const reqBody = req.body;

  try {
    const offering = await new Offering({
      comment: reqBody.comment,
      date: reqBody.date,
      offeredItems: reqBody.offeredItems,
      userId: reqBody.userId,
      postingId: req.params.postingId,
      status: "PENDING",
    }).save();

    const postingToUpdate = await Posting.findOneAndUpdate(
      {
        _id: req.params.postingId,
      },
      { $push: { offerings: offering._id } },
      { new: true }
    );

    const offerer = await User.findOne({
      _id: offering.userId,
    });

    await Notifications(
      postingToUpdate.ownerId,
      "newOffering",
      "Your posting has received new offering from " + offerer.userName
    );

    res.status(201).json(offering);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

module.exports = router;

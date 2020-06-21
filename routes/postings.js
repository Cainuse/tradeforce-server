const express = require("express");
const router = express.Router();
const Posting = require("../models/Posting");
const { route } = require("./users");

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
// POST
// Creates new posting based on input parameters
router.post("/", async (req, res) => {
  const reqBody = req.body;
  const posting = new Posting({
    title: reqBody.title,
    date: reqBody.date,
    description: reqBody.description,
    category: reqBody.category,
    condition: reqBody.condition,
    quantity: reqBody.quantity,
    tags: reqBody.tags,
    requestedItems: reqBody.requestedItems,
    //imgSrc: reqBody.imgSrc,
    ownerId: reqBody.ownerId,
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
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// DELETE
router.delete("/:postingId", async (req, res) => {
  try {
    const deletedPosting = await Posting.remove({ _id: req.params.postingId });
    res.status(204).send();
  } catch (err) {
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
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});
module.exports = router;

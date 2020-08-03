const express = require("express");
const router = express.Router();
const Offering = require("../models/Offering");
const Posting = require("../models/Posting");
const User = require("../models/User").User;
const Notifications = require("../utils/notificationsUtil");

// http://localhost/api/offerings/{offeringId}/accept ///////////////////////////////////////////////////////
// POST
// Accepts the indicated offering
router.post("/:offeringId/accept", async (req, res) => {
  try {
    const offering = await Offering.findOneAndUpdate(
      {
        _id: req.params.offeringId,
      },
      {
        $set: { status: "ACCEPTED" },
      },
      {
        new: true,
      }
    );

    const postingOfOffering = await Posting.findOneAndUpdate(
      {
        _id: offering.postingId,
      },
      {
        $set: { active: false },
      },
      {
        new: true,
      }
    );

    const offeringsofPosting = postingOfOffering.offerings;

    const postingOwner = await User.findOne({ _id: postingOfOffering.ownerId });

    await Notifications(
      offering.userId,
      "offeringAccepted",
      postingOwner.userName + " accepted your offer."
    );

    offeringsofPosting.forEach(async (offeringId) => {
      if (offeringId != req.params.offeringId) {
        const rejectedOffering = await Offering.findOneAndUpdate(
          {
            _id: offeringId,
          },
          {
            $set: { status: "REJECTED" },
          },
          {
            new: true,
          }
        );

        await Notifications(
          rejectedOffering.userId,
          "offeringRejected",
          postingOwner.userName + " rejected your offer."
        );
      }
    });

    res.status(200).json(offering);
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// http://localhost/api/offerings/{offeringId}/rescind ///////////////////////////////////////////////////////
// POST
// Rescinds the indicated offering
router.post("/:offeringId/rescind", async (req, res) => {
  try {
    const offering = await Offering.findOneAndUpdate(
      {
        _id: req.params.offeringId,
      },
      {
        $set: { status: "RESCINDED" },
      },
      {
        new: true,
      }
    );

    res.status(200).json(offering);
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// http://localhost/api/offerings/{offeringId}/reject ///////////////////////////////////////////////////////
// POST
// Rejects the indicated offering
router.post("/:offeringId/reject", async (req, res) => {
  try {
    const offering = await Offering.findOneAndUpdate(
      {
        _id: req.params.offeringId,
      },
      {
        $set: { status: "REJECTED" },
      },
      {
        new: true,
      }
    );

    const posting = await Posting.findOne({
      _id: offering.postingId,
    });

    const postingOwner = await User.findOne({ _id: posting.ownerId });

    await Notifications(
      offering.userId,
      "offeringRejected",
      postingOwner.userName + " rejected your offer."
    );

    res.status(200).json(offering);
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

module.exports = router;

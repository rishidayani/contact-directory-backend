const express = require("express");
const auth = require("../middleware/auth");
const Shared = require("../models/sharedContact");

const router = new express.Router();

//get all shared contacts
router.get("/shared", auth, async (req, res) => {
  const _id = req.user._id;
  try {
    const shared = await Shared.find({ recieverId: _id });

    res.status(200).send(shared);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/contacts/shared", auth, async (req, res) => {
  const _id = req.user._id;
  const rId = req.body.recieverId;

  const user = await Shared.findOne({ recieverId: rId, senderId: _id });
  if (user) {
    for (let i = 0; i < req.body.contacts.length; i++) {
      user.contacts.push(req.body.contacts[i]);
    }
    await user.save();
    return res.status(200).send(user);
  } else {
    const shared = new Shared({
      ...req.body,
      senderId: _id,
    });
    try {
      await shared.save();
      res.send(shared);
    } catch (e) {
      res.status(500).send(e);
    }
  }
});

router.patch("/shared", auth, async (req, res) => {
  try {
    const sharerId = req.body.id;
    const mobile = req.body.mobile;
    console.log(req.body);
    const update = { $pull: { contacts: { mobile } } };
    const options = { new: true };
    const sharer = await Shared.findOneAndUpdate(
      { _id: sharerId },
      update,
      options
    );
    res.send(sharer);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;

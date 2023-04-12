const express = require(`express`);
const User = require("../models/user.js");
const auth = require("../middleware/auth.js");
const Contact = require("../models/contact.js");
const router = new express.Router();

//sign up
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  if(!user.image) {
    user.image = 'https://images.unsplash.com/photo-1679403423791-91e190b4a9c2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80'
  }

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/login", async (req, res) => {
    try {
      const user = await User.findByCredentials(
        req.body.email,
        req.body.password
      ); //User defined find method
      const token = await user.generateAuthToken();
      res.send({ user, token });
    } catch (e) {
      res.status(400).send(e);
    }
  });

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
        return token.token !== req.token
    })
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// router.get("/users/:userId", auth, async (req, res) => {
//   const id = req.params.userId;

//   try {
//     const user = await User.findById(id);
//     res.send(user);
//   } catch (e) {
//     res.send(e);
//   }
// });

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["userName", "email", "password","age", "image", "gender"];
  const isValid = updates.every((update) => allowedUpdates.includes(update));

  if (!isValid) {
    return res.status(400).send("Update field is not valid");
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    res.send(req.user);
  } catch (e) {
    res.send(e);
  }
});

router.delete("/users/me", auth, async (req, res) => {
//   const id = req.params._id;
  try {
    // const user = await User.findByIdAndDelete(id);
    // if (!user) {
    //   return res.status(404).send("No such user Exist");
    // }
    // console.log(req.user);
    await req.user.deleteOne()
    await Contact.deleteMany({owner:req.user._id})
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

// router.get('/users', async (req, res) => {
//     try {
//         const users = await User.find({})
//         res.send(users)
//     } catch (e) {
//         res.status(500).send()
//     }
// })
module.exports = router;

const auth = require("../middleware/auth.js");
const Contact = require(`../models/contact.js`);
const express = require(`express`);
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  REFRESH_TOKEN,
} = require("../keys/google_key.js");

const router = new express.Router();

router.get("/contacts", auth, async (req, res) => {
  try {
    // const contacts = await Contact.find({owner: req.user._id});
    // res.send(contacts);  //one approach
    await req.user.populate("contacts");
    res.send(req.user.contacts);
  } catch (e) {
    res.send(e);
  }
});

router.get("/contacts/search/:name", auth, async (req, res) => {
  const nameEntered = req.params.name;
  try {
    const contact = await Contact.find({
      name: nameEntered,
      owner: req.user._id,
    });
    res.send(contact);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.post("/contacts/search", auth, async (req, res) => {
  const payload = req.body.payload;
  const regex = new RegExp("^.*" + payload + ".*", "i");
  let search = await Contact.find({
    name: { $regex: regex },
    owner: req.user._id,
  }).exec();
  search = search.slice(0, 5);
  res.send(search);
});

router.get("/contacts/:contactId", auth, async (req, res) => {
  const id = req.params.contactId;

  try {
    // const contact = await Contact.findById(id);
    const contact = await Contact.findOne({ _id: id, owner: req.user._id });
    if (!contact) {
      return res.send(`No contact found`);
    }
    res.send(contact);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.post("/contacts/add", auth, async (req, res) => {
  // const contact = new Contact(req.body);
  const contact = new Contact({
    ...req.body,
    owner: req.user._id,
  });

  if (!contact.photo) {
    contact.photo =
      "https://media.istockphoto.com/id/1433039224/photo/blue-user-3d-icon-person-profile-concept-isolated-on-white-background-with-social-member.jpg?s=1024x1024&w=is&k=20&c=Ny3oxWfK9DQgG1xgaI2-iYhaiErqbmbY2cjLa4F1xAE=";
  }
  try {
    await contact.save();
    res.send(contact);
  } catch (e) {
    res.send(e);
  }
});

router.patch("/contacts/edit/:contactId", auth, async (req, res) => {
  const id = req.params.contactId;
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "mobile", "createdAt", "updatedAt", "photo"];
  const isValid = updates.every((update) => allowedUpdates.includes(update));

  if (!isValid) {
    return res.send({ error: `Invalid updates!` });
  }
  try {
    const contact = await Contact.findOne({ _id: id, owner: req.user._id });
    if (!contact) {
      return res.status(404).send(`No contact to update with that id`);
    }

    updates.forEach((update) => (contact[update] = req.body[update]));
    await contact.save();
    res.send(contact);
  } catch (e) {
    res.send(e);
  }
});

router.delete(`/contacts/:contactId`, auth, async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.contactId,
      owner: req.user._id,
    });
    if (!contact) {
      return res.status(404).send("No contact with that id");
    }
    res.send(contact);
  } catch (e) {
    res.status(500).send(`Error: ${e}`);
  }
});



// Create a new OAuth2Client instance
const oauth2Client = new OAuth2Client({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI,
});

// router.use(bodyParser.json());

async function getAccessToken() {
  try {
    const { tokens } = await oauth2Client.refreshToken(REFRESH_TOKEN);
    return tokens.access_token;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to obtain new access token");
  }
}

// define API endpoints
router.get("/api/people", async (req, res) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    res.status(401).send("Authorization header missing");
    return;
  }
  const access_token = authorization.replace("Bearer ", "");
  // console.log("Getting user's connections...");

  try {
    // Set the access token for the client
    oauth2Client.setCredentials({ access_token });

    // Create a new People API client
    const people = google.people({
      version: "v1",
      auth: oauth2Client,
    });

    const { data } = await people.people.connections.list({
      resourceName: "people/me",
      personFields: "names,emailAddresses",
      sortOrder: "LAST_MODIFIED_DESCENDING",
    });

    const connections = data.connections || [];
    // console.log(connections[0].names);

    res.send(connections);
  } catch (e) {
    if (e.code === 401) {
      const access_token = await getAccessToken();
      oauth2Client.setCredentials({ access_token });

      // Retry fetching the user's connections with the new access token
      const people = google.people({
        version: "v1",
        auth: oauth2Client,
      });

      const { data } = await people.people.connections.list({
        resourceName: "people/me",
        personFields: "names,emailAddresses,phoneNumbers",
        sortOrder: "LAST_MODIFIED_DESCENDING",
      });

      const connections = data.connections || [];
      // console.log(connections[0].names);

      res.send(connections);
    } else {
      console.error(err);
      res.status(500).send("Failed to fetch contacts");
    }
  }
});

module.exports = router;

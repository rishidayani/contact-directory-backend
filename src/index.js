const cors = require("cors");
const contactRouter = require(`./routers/contact.js`);
const express = require(`express`);
require(`./db/mongoose.js`);
const userRouter = require(`./routers/user.js`);
const sharedRouter = require(`./routers/sharedContact.js`);

const app = express();
app.use(cors());
app.use(express.json());
app.use(contactRouter);
app.use(userRouter);
app.use(sharedRouter);

// app.use(function(req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

app.listen(3000, () => {
  console.log(`Server is on port 3000`);
});

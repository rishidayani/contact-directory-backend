const express = require(`express`);
require(`./db/mongoose.js`)
const contactRouter = require(`./routers/contact.js`)
const userRouter = require(`./routers/user.js`)
const cors = require('cors');

const app = express();
app.use(cors())
app.use(express.json());
app.use(contactRouter);
app.use(userRouter)

app.listen(3000, () => {
  console.log(`Server is on port 3000`);
});

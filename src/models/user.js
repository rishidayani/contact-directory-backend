const bcrypt = require(`bcryptjs`);
const jwt = require(`jsonwebtoken`);
const mongoose = require(`mongoose`);
const validator = require(`validator`);

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("password cannot be password");
      }
    },
  },
  image: {
    type:String
  },
  age: {
    type: Number,
    default: 0
  },
  gender: {
    type: String,
    default : 'Male'
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.virtual('contacts', {
  ref: 'Contact',
  localField: '_id',
  foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject  = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "argusoft", {
    expiresIn: '1h'
  });

  user.tokens = user.tokens.concat({ token });
    await user.save()

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};


//Hashing Password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  // console.log('Before saving');
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

//Delete the task when user is removed
// userSchema.pre("deleteOne",async function (next) {
//   // const user = this
//   console.log('ABc');
//   // const contact =  await Contact.deleteMany({owner: user._id})
//   // console.log(contact);
//   next()
// })

const User = mongoose.model(`User`, userSchema);

module.exports = User;

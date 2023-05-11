const mongoose = require("mongoose");

const sharedContactSchema = new mongoose.Schema({
  senderId: {
    type: String,
    requied: true,
  },
  recieverId: {
    type: String,
    requied: true,
  },
  senderDetails: {
    type: {
      userName: {
        type: String,
      },
      image: String,
    },
  },
  contacts: {
    type: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        firstName: {
          type: String,
          // required: true,
          trim: true,
        },
        lastName: {
          type: String,
          // required: true,
          trim: true,
        },
        mobile: {
          type: String,
          required: true,
          minlength: 10,
          trim: true,
        },
        photo: {
          type: String,
        },
        createdAt: {
          type: Date,
        },
        updatedAt: {
          type: Date,
        },
      },
      {
        timestamps: true,
      },
    ],
  },
});

const Shared = mongoose.model(`Shared`, sharedContactSchema);

module.exports = Shared;

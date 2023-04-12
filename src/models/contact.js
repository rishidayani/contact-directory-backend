const mongoose = require(`mongoose`);

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      minlength: 10,
      trim: true,
    },
    photo: {
      type: String
    },
    created_at: {
      type: Date,
    },
    updated_at: {
      type: Date,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model(`Contact`, contactSchema);

module.exports = Contact;

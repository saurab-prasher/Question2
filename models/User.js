const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "Your firstname is required"],
      max: 25,
    },
    last_name: {
      type: String,
      required: [true, "Your lastname is required"],
      max: 25,
    },
    email: {
      type: String,
      required: [true, "Your email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Your password is required"],

      max: 25,
    },
  },
  { timestamps: true }
);

userSchema.statics.findAndValidate = async function (email, password) {
  const foundUser = await this.findOne({ email: email });

  if (!foundUser) {
    // User not found
    return null;
  }

  const isValid = await bcrypt.compare(password, foundUser.password);

  return isValid ? foundUser : null;
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("User", userSchema);

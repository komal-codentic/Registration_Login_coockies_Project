require("dotenv").config();
const async = require("hbs/lib/async");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
userSchema = new Schema({
  //unique_id: Number,
  email: String,
  username: String,
  password: String,
  passwordConf: String,
  tokens: [
    {
      token1: { type: String, required: true },
    }, 
  ],
});
userSchema.methods.generateAuthToken = async function () {
  try {
    console.log("id is the:", this._id);
    const tokencreate = jwt.sign(
      { _id: this._id.toString() },process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token1: tokencreate });
    await this.save();
    return tokencreate;
  } catch (error) {
    res.send("the error" + error);
    console.log("the error" + error);
  }
};

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);

    this.passwordConf = await bcrypt.hash(this.password, 10);
  }
  next();
});
const Register = mongoose.model("Register", userSchema);

module.exports = Register;

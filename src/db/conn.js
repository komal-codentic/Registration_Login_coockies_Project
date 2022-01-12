const mongoose = require("mongoose");
const validator = require("validator");

mongoose.connect("mongodb://localhost:27017/Regform")
  .then(() => console.log(`connection successfull"`))
  .catch((e) => console.log(`no connection`));
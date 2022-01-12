require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const hbs = require("hbs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const auth=require("../src/middleware/auth");


const async = require("hbs/lib/async");
require("../src/db/conn");
const Register = require("../src/models/registers");

const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");
console.log(path.join(__dirname, "../templates/partials"));

hbs.registerPartials(partials_path);

app.set("view engine", "hbs");
app.set("views", template_path);

var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

console.log(process.env.SECRET_KEY);


app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secretpage",auth, (req, res) => {
  console.log(`this is cookie===:---${req.cookies.jwt}`);
   res.render("secretpage");
});

app.get("/logout",auth,async(req, res) => {
  try{ 
    console.log(req.user); 
    
//for single logout from current device
//     req.user.tokens=req.user.tokens.filter((currentElement)=>{
//       return currentElement.token!==req.token
//     })
    
    req.user.tokens=[];    
    res.clearCookie("jwt");

    console.log("logout succesfully");

    await req.user.save();
    res.redirect("/");
  }
  catch (error) {
    res.status(500).send(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;
    console.log(`${email} and password is ${password}`);

    const usermail = await Register.findOne({ email: email });

    const isMatch =await bcrypt.compare(password, usermail.password);
    console.log(isMatch);
    const token = await usermail.generateAuthToken();
    console.log("the token part----" + token);

    res.cookie("jwt",token,{expires:new Date(Date.now()+9000),httpOnly:true});
     

    if (isMatch) {
      //res.status(201).render("404page");
      const name = usermail.username;
      res.send({ Success: "welcome!" + name });
    } else {
      res.send({ Success: "password not matching!" });
    }
     } catch (error) {
    res.status(400).send("invalid email");
  }
});

app.post("/register", async (req, res) => {
  try {
    console.log(req.body.username);

    const passwords = req.body.password;
    const cpassword = req.body.passwordConf;

    if (passwords === cpassword) {
      const registerEmployee = new Register({
        email: req.body.email,
        username: req.body.username,
        password: passwords,
        passwordConf: cpassword,
      });
      console.log("success part" + registerEmployee);
      const tokencreate = await registerEmployee.generateAuthToken();
      console.log("the token part is: " + tokencreate);

      // the res.cookie function is used to set cookie name to value
      // the value parameter ma be string or object converted to json

      res.cookie("jwt",tokencreate,{expires:new Date(Date.now()+000),httpOnly:true});
      console.log(cookie);
      const registered = await registerEmployee.save();
      console.log("the page part is: " + registered);
 
      res.status(201).redirect("login");
    } else {
      res.send("password incorrect");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
app.get("/login", async (req, res) => {
  res.render("login");
});


app.listen(port, () => {
  console.log(`server is running at port${port}`);
});

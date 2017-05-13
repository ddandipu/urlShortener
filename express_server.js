var express = require("express");
//var cookieParser= require("cookie-parser");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.set("view engine", "ejs");
//set EJS
//beginning URL database and User database
var urlDatabase = {};
// the links database
var cookieSession = require('cookie-session')

app.use(cookieSession({
   name: 'session',
   keys: ["secret"],

   maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
    urls: {}
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
    urls: {}
  }
}
// the user database, modified so that they actually own the shortURLS they created
// end URL and user database
//reg page GET and POST
app.get("/register", (req, res) => {
  let templateVars =  {urls: urlDatabase
  };
  res.render("urls_register", templateVars);
});
//renders registration page
app.post("/register", (req, res) => {
  if ((req.body.email.length < 1) || (req.body.password.length < 1)) {
    res.status(400).end("empty strings in email or password tab");
  }
    for (let user in users) {
      if(req.body.email == users[user].email) {
        res.status(400).end("email already in database");
        return;
      }
    }
       let randomID = generateRandomString();
       users[randomID] = {id : randomID,
       email: req.body.email,
       password: bcrypt.hashSync(req.body.password, 10),
       urls : {}
       };
       req.session.user_id = randomID;
       res.redirect("/urls");
       console.log(users);
});
// takes in email and password for registration page, with checks for length and if
// the inputted email is already in database. Also assigns random userID and session.
app.get("/login", (req, res) =>{
  let templateVars =  {urls: urlDatabase
  };
  res.render("urls_login", templateVars);
});
// renders login page
app.post("/login", (req, res) => {
  for (var user in users) {
    if (users[user].email === req.body.email) {
     if (bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session.user_id = users[user].id;
      res.redirect("/urls");
      return;
     } else {
      res.status(403).end("password do not match");
      return;
     }
    }
  }
  res.status(403).end("email doesnt exist, pls register");
});// end func
// checks inputted login credentials to our database, password is hashed, cookies are set to session.

app.get("/", (req, res) => {
  res.end("Hello!");
});
// test page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// test page
app.get("/hello", (req, res) =>{
  res.end("<html><body>Hello <b>World</b></body></html>\n")
});
// another test page
app.get("/urls", (req, res) =>{
    let templateVars = {userurls : {}};
  if (req.session.user_id) {
      templateVars.userid = users[req.session["user_id"]].id;
      templateVars.usermail = users[req.session["user_id"]].email;
      templateVars.userpass = users[req.session["user_id"]].password;
      templateVars.userurls = users[req.session["user_id"]].urls;
    } else {
      templateVars.userid = undefined;
    }
  res.render("urls_index", templateVars);
});
// renders page with the index of URLs for signed in users
app.get("/urls/new", (req, res) => {
  let templateVars = {urls: urlDatabase,
                      userurls: {}
                       };

  if (req.session["user_id"]) {
      templateVars.userid   = users[req.session["user_id"]].id;
      templateVars.usermail = users[req.session["user_id"]].email;
      templateVars.userpass = users[req.session["user_id"]].password;
      } else {
      templateVars.userid = undefined;
      res.render("urls_index", templateVars);
      return;
    }
  res.render("urls_new", templateVars);
});
// renders page which allows logged in user to input a new site address
app.post("/urls", (req, res) => {

  let shortURL =generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  let id = req.session.user_id;
  users[id].urls[shortURL] = req.body.longURL;

  res.redirect("/urls/" + shortURL)
});
// pairs the site address user inputs into form with a randomly generated string, takes you to the page
// where the new pairing resides

app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/urls");
});
//logs out of the program

// beginning of /:id stuff
app.get("/urls/:id", (req, res) => {

  let templateVars = { shortURL: req.params.id,
                       urls: urlDatabase,
                       };
  if (req.session["user_id"]) {
      templateVars.userid = users[req.session["user_id"]].id;
      templateVars.usermail = users[req.session["user_id"]].email;
      templateVars.userpass = users[req.session["user_id"]].password;
      } else {
      templateVars.userid = undefined;
      res.render("urls_login");
      return;
    }

  res.render("urls_show", templateVars);
});
// creates a page to see individual shortURL and regular website pairing
app.post("/urls/:id", (req, res) => {

  let ident = req.session.user_id;
  let shortURL = req.params.id;
  if((users[ident].urls[shortURL]) === (urlDatabase[shortURL])) {
  urlDatabase[shortURL] = req.body.longURL;
  users[ident].urls[shortURL] = req.body.longURL;
  res.redirect("/urls/" + shortURL);
  } else {
    res.send("no access to this shortURL")
  }
});
// owners of the pairing may put in a new site and pair it with existing shortURL,
// if you dont own the shortURL and try this, you'll get a HTML telling you youre not allowed to make changes
app.post("/urls/:id/delete", (req, res) => {

  let ident = req.session.user_id;
  let shortURL = req.params.id;
  if((users[ident].urls[shortURL]) === (urlDatabase[shortURL])) {
  delete urlDatabase[req.params.id]
  delete users[ident].urls[shortURL]
  res.redirect("/urls")
  } else {
    res.send("no access to this shortURL");
  }
});
// every shortURL can be deleted by their owners, the button appears in main index page
app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  let longURL = undefined;
  for (var shortURL in urlDatabase) {
    if (shortURL === req.params.shortURL) {
      longURL = urlDatabase[shortURL];
      break;
    }
  }
  if (longURL !== undefined) {
    res.redirect(longURL);
  } else {
      res.end ("<p> No shortURL found </p>");
  }
});
// this pulls the regular site address from shortURL and puts it into browser bar
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
// server check
function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < 6; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
  } return text;
}
// function which generates numbers
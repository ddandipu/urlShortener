var express = require("express");
var cookieParser= require("cookie-parser");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");
//set EJS
//beg URL database and User database
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}
// end URL and user database
//reg page GET and POST
app.get("/register", (req, res) => {
  let templateVars =  {urls: urlDatabase
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  if ((req.body.email.length < 1) || (req.body.password.length < 1)) {
    res.status(400).end("empty strings in email or password tab");
  }
    for (let user in users) {
      if(req.body.email == users[user].email) {
        res.status(400).end("email already in database");
      }
    }
      let randomID = generateRandomString();
      users[randomID] = {id : randomID,
      email: req.body.email,
      password: req.body.password
      };
      res.cookie("user_id", randomID);
      console.log(users);
      res.redirect("/urls");
});

app.get("/login", (req, res) =>{
  let templateVars =  {urls: urlDatabase
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  for (var user in users) {
    if (users[user].email === req.body.email) {
     if (users[user].password === req.body.password) {
      res.cookie("user_id", users[user].id);
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


app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) =>{
  res.end("<html><body>Hello <b>World</b></body></html>\n")
});

app.get("/urls", (req, res) =>{
  let templateVars = {urls: urlDatabase,
                       };
  if (req.cookies["user_id"]) {
      templateVars.userid = users[req.cookies["user_id"]].id;
      templateVars.usermail = users[req.cookies["user_id"]].email;
      templateVars.userpass = users[req.cookies["user_id"]].password;
      } else {
      templateVars.userid = undefined;
    }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {urls: urlDatabase,
                       };
  if (req.cookies["user_id"]) {
      templateVars.userid = users[req.cookies["user_id"]].id;
      templateVars.usermail = users[req.cookies["user_id"]].email;
      templateVars.userpass = users[req.cookies["user_id"]].password;
      } else {
      templateVars.userid = undefined;
      res.render("urls_login");
      return;
    }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);
  let shortURL =generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/" + shortURL)
});


app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.redirect("/urls")
});


// beginning of /:id stuff
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urls: urlDatabase,
                       };
  if (req.cookies["user_id"]) {
      templateVars.userid = users[req.cookies["user_id"]].id;
      templateVars.usermail = users[req.cookies["user_id"]].email;
      templateVars.userpass = users[req.cookies["user_id"]].password;
      } else {
      templateVars.userid = undefined;
    }

  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  //console.log(req.body);
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/" + shortURL)
});

app.post("/urls/:id/delete", (req, res) => {
  //console.log(req.body);
  delete urlDatabase[req.params.id]
  res.redirect("/urls")
});

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < 6; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
  } return text;
}
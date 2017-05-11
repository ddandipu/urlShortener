var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
//set EJS
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  let templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  //console.log(req.body);
  let shortURL =generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/" + shortURL)
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urls: urlDatabase};
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
  res.redirect("/urls/")
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